//server settings
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const authMiddleware = require('./authMiddleware');
const adminOnly = require('./adminMiddleware');
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));

//connect to DB
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  ssl: {
    ca: fs.readFileSync('./ca.pem')
  }
});

//sign up API
app.post('/signup', async (req, res) => {
  const { name, email, password, signupCode, unit, class_number } = req.body;

	if (signupCode !== process.env.SIGNUP_CODE) {
    return res.status(403).json({
      error: '보안 코드가 올바르지 않습니다'
    });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
			"UPDATE users SET email = ?, password = ?, role = 'user', unit = ?, class_number = ? WHERE name = ?",
			[email, hashed, unit, class_number, name]
		);

    res.json({ message: '회원가입 성공' });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: '이미 존재하는 이메일' });
    }

    console.error(err);
    res.status(500).json({ error: '회원가입 실패' });
  }
});

//login API
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // compare email
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: '존재하지 않는 이메일' });
    }

    const user = rows[0];

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: '비밀번호 틀림' });
    }

    // give jwt token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: '로그인 성공',
      token,
			user: {id: user.id, email: user.email, role: user.role}
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '로그인 실패' });
  }
});

//Leave Registration API
app.post('/outings', authMiddleware, async (req, res) => {
  const {
    start_date,
    end_date,
    reason,
    notes,
    members,
    transport,
    schedule,
    detail,
    contact,
    lastOutingStart,
		lastOutingEnd
  } = req.body;

  try {
		//duplication test
		const realEndDate = new Date(end_date);
		realEndDate.setDate(realEndDate.getDate() - 1);

		const [myDuplicated] = await pool.query(`
			SELECT *
			FROM outings
			WHERE user_id = ?
			AND (
				start_date <= ?
				AND DATE_SUB(end_date, INTERVAL 1 DAY) >= ?
			)`,
			[req.user.id, realEndDate, start_date]);

		if (myDuplicated.length > 0) {
			return res.status(400).json({
				error: '이미 해당 기간에 출타 신청이 있습니다'
			});
		}

		//duplication test (outing)
		if (reason === '외출') {
			const duplicated = [];

      for (const name of members) {
        const [rows] = await pool.query(`
          SELECT *
          FROM outing_members om
          JOIN outings o ON om.outing_id = o.id
          WHERE om.name = ?
          AND (
            o.start_date = ? AND o.end_date = ?
          )
        `, [name, start_date, end_date]);

        if (rows.length > 0) {
						duplicated.push(name);
					}
				}

				if (duplicated.length > 0) {
					return res.status(400).json({
						duplicated,
						message: '이미 외출 신청된 인원이 있습니다'
					});
      }
    }

    // 1. Common
    const [result] = await pool.query(
      `INSERT INTO outings (user_id, start_date, end_date, reason, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, start_date, end_date, reason, notes || null]
    );

    const outingId = result.insertId;

    // 2. Leave
    if (reason === '휴가') {
      await pool.query(
        `INSERT INTO leave_details
        (outing_id, transport, detail, contact, last_outing_start, last_outing_end)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [outingId, transport, detail, contact, lastOutingStart, lastOutingEnd]
      );
    }

    // 3. Outing
    if (reason === '외출') {
      await pool.query(
        `INSERT INTO outing_details
        (outing_id, transport, schedule)
        VALUES (?, ?, ?)`,
        [outingId, transport, schedule]
      );

			for (const name of members) {
			await pool.query(
				`INSERT INTO outing_members (outing_id, name)
				VALUES (?, ?)`,
				[outingId, name]
			);
		 }
    }

    res.json({ message: '출타 신청 완료' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '등록 실패' });
  }
});

//Leave Registration Correction API
app.patch("/outings/:id", authMiddleware, async (req, res) => {

    try {

      const { id } = req.params

      const {
				start_date,

				end_date,

        reason,

        members,

        transport,

        schedule,

        detail,

        contact,

        lastOutingStart,

        lastOutingEnd,

        notes

      } = req.body

			//duplication test (outing)
			if (reason === '외출') {
				const duplicated = [];

				for (const name of members) {
					const [rows] = await pool.query(`
						SELECT *
						FROM outing_members om
						JOIN outings o ON om.outing_id = o.id
						WHERE om.name = ?
						AND (
							o.start_date = ? AND o.end_date = ?
						)
						AND o.id != ?
					`, [name, start_date, end_date, id]);

					if (rows.length > 0) {
							duplicated.push(name);
						}
					}

					if (duplicated.length > 0) {
						return res.status(400).json({
							duplicated,
							message: '이미 외출 신청된 인원이 있습니다'
						});
				}
			}

		// 1. Common
    await pool.query(
      `UPDATE outings SET reason = ?, notes = ?, status = 'pending' WHERE id = ?`,
      [reason, notes || null , id]
    );

		const outingId = id


    // 2. Leave
    if (reason === '휴가') {
      await pool.query(
        `UPDATE leave_details SET transport = ?, detail = ?, contact = ?, last_outing_start= ?,
				last_outing_end = ? WHERE outing_id = ?`,
        [transport, detail, contact, lastOutingStart, lastOutingEnd, outingId]
      );
    }

    // 3. Outing
    if (reason === '외출') {
      await pool.query(
        `UPDATE outing_details SET transport = ?, schedule = ? WHERE outing_id = ?`,
        [transport, schedule, outingId]
      );

			await pool.query(

				`
				DELETE
				FROM outing_members
				WHERE outing_id = ?
				`,

				[outingId]
			)

			for (const name of members) {

				await pool.query(

					`
					INSERT INTO outing_members
					(outing_id, name)

					VALUES (?, ?)
					`,

					[outingId, name]
				)
			}
    }

	  return res.status(200).json({
      message: "출타 수정 완료"
    })

	} catch (err) {

				console.error(err)

				return res.status(500).json({
					error: "서버 오류"
				})
			}
  }
);

//Leave schedule Check API
app.get('/outings', authMiddleware, async (req, res) => {
  const [rows] = await pool.query('SELECT outings.*, users.name FROM outings JOIN users ON outings.user_id = users.id');
  res.json(rows);
});

//Schedule Management API
app.get('/outings/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {

    let query = `
      SELECT *
      FROM outings
      WHERE id = ?
    `;

    const params = [id];

    // 일반 사용자만 본인 데이터 제한
    if (req.user.role !== 'admin') {
      query += ` AND user_id = ?`;
      params.push(req.user.id);
    }

    const [[outing]] = await pool.query(query, params);

    if (!outing) {
      return res.status(404).json({
        error: '출타 정보를 찾을 수 없습니다.'
      });
    }

    let detail = {};

    switch (outing.reason) {

      case '휴가': {

        const [[leave]] = await pool.query(
          `SELECT * FROM leave_details WHERE outing_id = ?`,
          [id]
        );

        detail = leave || {};
        break;
      }

      case '외출': {

        const [[[out]], [members]] = await Promise.all([
          pool.query(
            `SELECT * FROM outing_details WHERE outing_id = ?`,
            [id]
          ),
          pool.query(
            `SELECT name FROM outing_members WHERE outing_id = ?`,
            [id]
          )
        ]);

        detail = {
          ...(out || {}),
          members: members.map(m => m.name)
        };

        break;
      }
    }

    res.json({
      outing,
      detail
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: '조회 실패'
    });
  }
});

//Delete API
app.delete('/outings/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  await pool.query('DELETE FROM outings WHERE id = ?',
	[id]
	);

  res.json({ message: '삭제 완료' });
});

//Admin Approve Leave API
app.put('/admin/outings/:id', authMiddleware, adminOnly, async (req, res) => {
  const { status } = req.body; // approved / rejected
  const { id } = req.params;

  await pool.query(
    'UPDATE outings SET status = ? WHERE id = ?',
    [status, id]
  );

  res.json({ message: '상태 변경 완료' });
});

//Leave Percentage API
function formatDate(date) {
  return new Date(date)
    .toISOString()
    .split('T')[0];
}

const getGroupUnit = (unit) => {

  if (
    unit === '81mm 소대' ||
    unit === '중대본부'
  ) {
    return '81/중본';
  }

  if (
    unit === '전투지원소대' ||
    unit === '비궁'
  ) {
    return '전/비';
  }

  return unit;
};

//Outing-rate API
app.get('/outing-rate', authMiddleware, async (req, res) => {
  try {

    // unit headcount
    const [totalRows] = await pool.query(`
      SELECT
        unit,
        COUNT(*) AS total
      FROM users
      GROUP BY unit
    `);

		const groupedTotals = {}

		for (const row of totalRows) {
			const group = getGroupUnit(row.unit);

			if (!groupedTotals[group]) {
				groupedTotals[group] = 0;
			}

			groupedTotals[group] += row.total;
		}

    const [outings] = await pool.query(`
      SELECT
        outings.user_id,
        outings.start_date,
        outings.end_date,
        users.unit
      FROM outings
      JOIN users
        ON outings.user_id = users.id
    `);

    // Setting Range
    const [rangeRows] = await pool.query(`
      SELECT
        MIN(start_date) AS minDate,
        MAX(end_date) AS maxDate
      FROM outings
    `);

    const minDate =
      new Date(rangeRows[0].minDate);

    const maxDate =
      new Date(rangeRows[0].maxDate);

    const result = [];

		//Calculating

    for (
      let current = new Date(minDate);
      current <= maxDate;
      current.setDate(current.getDate() + 1)
    ) {

      const date = formatDate(current);

      for (const group in groupedTotals) {

        const count = outings.filter(o => {
					const end = new Date(o.end_date);
  				end.setDate(end.getDate() - 1);

          return (
            getGroupUnit(o.unit) === group &&
            date >= formatDate(o.start_date) &&
            date <= formatDate(end)
          );

        }).length;

        result.push({
          date,
          unit: group,
          rate: (
            count / groupedTotals[group] * 100
          ).toFixed(1)
        });
      }
    }

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: '조회 실패'
    });
  }
});

//Dispatch API
app.post("/dispatches", authMiddleware, adminOnly, async (req, res) => {

    try {

      const {
        name,
        reason,
        start_date,
        end_date,
        memo
      } = req.body

      if (
        !name ||
        !reason ||
        !start_date ||
        !end_date ||
        !memo
      ) {
        return res.status(400).json({
          message: "모든 항목을 입력해주세요."
        })
      }

      // 유저 조회
      const [users] = await pool.query(

        `
        SELECT id
        FROM users
        WHERE name = ?
        `,

        [name]
      )

      if (users.length === 0) {

        return res.status(404).json({
          message: "해당 사용자를 찾을 수 없습니다."
        })
      }

      const userId = users[0].id

      // 파견 등록
      await pool.query(

        `
        INSERT INTO dispatches
        (
          user_id,
          reason,
          start_date,
          end_date,
          memo
        )
        VALUES (?, ?, ?, ?, ?)
        `,

        [
          userId,
          reason,
          start_date,
          end_date,
          memo
        ]
      )

      res.status(201).json({
        message: "파견 등록 완료"
      })

    } catch (err) {

      console.error(err)

      res.status(500).json({
        message: "서버 오류"
      })
    }

  }
);

//CMM API
app.get("/users", authMiddleware, adminOnly, async (req, res) => {

    try {

      const [users] = await pool.query(

        `
        SELECT
          id,
          name,
          unit,
          class_number,
					is_patient,
					patient_reason
        FROM users
        ORDER BY class_number ASC
        `
      )

      return res.status(200).json(users)

    } catch (err) {

      console.error(err)

      return res.status(500).json({
        message: "서버 오류"
      })
    }

  }
);

//Correction Modal API
app.patch("/users/:id", authMiddleware, adminOnly, async (req, res) => {

    try {

      const { id } = req.params

      const {
        name,
        unit,
        class_number,
				is_patient,
				patient_reason
      } = req.body

      if (
        !name ||
        !unit ||
        !class_number ||
				!is_patient ||
				!patient_reason

      ) {
        return res.status(400).json({
          message: "모든 항목을 입력해주세요."
        })
      }

      await pool.query(

        `
        UPDATE users
        SET
          name = ?,
          unit = ?,
          class_number = ?,
					is_patient = ?,
					patient_reason = ?

        WHERE id = ?
        `,

        [
          name,
          unit,
          class_number,
					is_patient,
					patient_reason,
          id
        ]
      )

      return res.status(200).json({
        message: "수정 완료"
      })

    } catch (err) {

      console.error(err)

      return res.status(500).json({
        message: "서버 오류"
      })
    }

  }
);

//Add User API
app.post("/users", authMiddleware, adminOnly, async (req, res) => {

    try {

      const {
        name,
        unit,
        class_number
      } = req.body

      if (
        !name ||
        !unit ||
        !class_number
      ) {
        return res.status(400).json({
          message: "모든 항목을 입력해주세요."
        })
      }

      await pool.query(

        `
        INSERT INTO users
        (
          name,
          unit,
          class_number
        )
        VALUES (?, ?, ?)
        `,

        [
          name,
          unit,
          class_number
        ]
      )

      return res.status(201).json({
        message: "전입신병 추가 완료"
      })

    } catch (err) {

      console.error(err)

      return res.status(500).json({
        message: "서버 오류"
      })
    }

  }
);

//Patient Count API
app.get("/patients/count", authMiddleware, adminOnly, async (req, res) => {

    try {

      const [rows] = await pool.query(

        `
        SELECT COUNT(*) AS count
        FROM users
        WHERE is_patient = 1
        `
      )

      return res.status(200).json({
        count: rows[0].count
      })

    } catch (err) {

      console.error(err)

      return res.status(500).json({
        message: "서버 오류"
      })
    }

  }
);

//Dispatch Count API
app.get("/dispatches/count", authMiddleware, adminOnly, async (req, res) => {

    try {

      const [rows] = await pool.query(

        `
        SELECT COUNT(*) AS count
        FROM dispatches
        WHERE
          start_date <= CURDATE()
          AND end_date >= CURDATE()
        `
      )

      return res.status(200).json({
        count: rows[0].count
      })

    } catch (err) {

      console.error(err)

      return res.status(500).json({
        message: "서버 오류"
      })
    }

  }
);

//Current Outing Count API
app.get("/outings-current-count", authMiddleware, adminOnly, async (req, res) => {

    try {

      const [rows] = await pool.query(

        `
        SELECT COUNT(*) AS count
        FROM outings
        WHERE
          status = 'approved'
          AND start_date <= NOW()
          AND end_date >= NOW()
        `
      )

      return res.status(200).json({
        count: rows[0].count
      })

    } catch (err) {

      console.error(err)

      return res.status(500).json({
        message: "서버 오류"
      })
    }

  }
);

//Pending Count API
app.get("/outings-pending-count", authMiddleware, adminOnly, async (req, res) => {

    try {

      const [rows] = await pool.query(

        `
        SELECT COUNT(*) AS count
        FROM outings
        WHERE status = 'pending'
        `
      )

      return res.status(200).json({
        count: rows[0].count
      })

    } catch (err) {

      console.error(err)

      return res.status(500).json({
        message: "서버 오류"
      })
    }

  }
);

//Delete User API
app.delete("/users/:id", authMiddleware, adminOnly, async (req, res) => {

    try {

      const { id } = req.params

      await pool.query(

        `
        DELETE FROM users
        WHERE id = ?
        `,

        [id]
      )

      return res.status(200).json({
        message: "중대원 삭제 완료"
      })

    } catch (err) {

      console.error(err)

      return res.status(500).json({
        error: "서버 오류"
      })
    }

  }
);

//CompanyRoster API
app.get("/company-roster", authMiddleware, adminOnly, async (req, res) => {

    try {
			let vacation = 0
			let visitStay = 0
			let hospital = 0
			let dispatch = 0

      const [users] =
        await pool.query(`

        SELECT
          id,
          name,
          unit,
          class_number

        FROM users
        ORDER BY

          CASE

            WHEN unit = '비궁'
              THEN 1

            WHEN unit = '81mm 소대'
              THEN 2

            WHEN unit = '전투지원소대'
              THEN 3

            ELSE 99

          END,

          class_number ASC
      `)

      const selectedDate = req.query.date

      const result = []

      for (const user of users) {

        let status = "-"

        // 파견 확인
        const [dispatches] =
          await pool.query(

            `
            SELECT id
            FROM dispatches
            WHERE
              user_id = ?
              AND start_date <= ?
              AND end_date >= ?
            `,

            [user.id, selectedDate, selectedDate]
        )

        if (dispatches.length > 0) {

          status = "파견"

        } else {

          // 출타 확인
          const [outings] =
            await pool.query(

              `
              SELECT reason
              FROM outings
              WHERE
                user_id = ?
                AND status = 'approved'
                AND DATE(start_date) <= ?
                AND DATE_SUB(DATE(end_date), INTERVAL 1 DAY) >= ?
              LIMIT 1
              `,

              [user.id, selectedDate, selectedDate]
          )

          if (outings.length > 0) {

            status =
              outings[0].reason
          }
        }

				//Count

				if (status === "휴가") {
					vacation++
				}

				if (status === "면회외박") {
					visitStay++
				}

				if (status === "외진") {
					hospital++
				}

				if (status === "파견") {
					dispatch++
				}

        result.push({

          ...user,

          status
        })
      }

			const total = users.length

			const absent =
				vacation +
				visitStay +
				hospital +
				dispatch

			const current =
				total - absent

      res.json({

				summary: {

					total,

					current,

					absent,

					vacation,

					visitStay,

					hospital,

					dispatch
				},

				users: result
			})

    } catch (err) {

      console.error(err)

      res.status(500).json({
        error: "서버 오류"
      })
    }
  }
);

//OutingRoster API
app.get("/outing-roster", authMiddleware, adminOnly, async (req, res) => {

    try {

      const selectedDate =
        req.query.date

      const [outings] =
        await pool.query(

          `
          SELECT

            o.id,

            o.reason,

            od.transport,

						od.schedule

          FROM outings o

          LEFT JOIN outing_details od
            ON o.id = od.outing_id

          WHERE

            o.status = 'approved'

            AND DATE(o.start_date) <= ?

            AND DATE_SUB(
              DATE(o.end_date),
              INTERVAL 1 DAY
            ) >= ?

          ORDER BY o.start_date ASC
          `,

          [
            selectedDate,
            selectedDate
          ]
      )

      const result = []

      for (const outing of outings) {

        const [members] =
          await pool.query(

            `
            SELECT name
            FROM outing_members
            WHERE outing_id = ?
            `,

            [outing.id]
        )

        result.push({

          outing_id: outing.id,

          members: members.map(
            (member) => ({

              name: member.name,

              unit: "화기중대",

              transport:
                outing.transport,

              reason:
                outing.reason,

							schedule:
								outing.schedule
            })
          )
        })
      }

      res.json(result)

    } catch (err) {

      console.error(err)

      res.status(500).json({
        error: "서버 오류"
      })
    }
  }
)

//Dispatch List
app.get("/dispatch-list", authMiddleware, adminOnly, async (req, res) => {

    try {

      const [rows] =
        await pool.query(

          `
          SELECT

            d.id,
            u.name,
            d.reason,
						d.memo,

						DATE_FORMAT(
							d.start_date,
							'%Y-%m-%d'
						) AS start_date,

						DATE_FORMAT(
							d.end_date,
							'%Y-%m-%d'
						) AS end_date

          FROM dispatches d

          JOIN users u
          ON u.id = d.user_id

          ORDER BY d.start_date ASC
          `
      )

      res.json(rows)

    } catch (err) {

      console.error(err)

      res.status(500).json({
        error: "서버 오류"
      })
    }
  }
)

//Delete Dispatch
app.delete("/dispatches/:id", authMiddleware, adminOnly, async (req, res) => {

    try {

      const { id } = req.params

      await pool.query(

        `
        DELETE
        FROM dispatches
        WHERE id = ?
        `,

        [id]
      )

      res.json({
        message: "삭제 완료"
      })

    } catch (err) {

      console.error(err)

      res.status(500).json({
        error: "서버 오류"
      })
    }
  }
)

//Pending Outings
app.get("/pending-outings", authMiddleware, adminOnly, async (req, res) => {

    try {

      const [rows] =
        await pool.query(

          `
					SELECT

						o.id,

						u.name,

						o.reason,

						DATE_FORMAT(
							o.start_date,
							'%Y-%m-%d'
						) AS start_date,

						DATE_FORMAT(
							DATE_SUB(
								o.end_date,
								INTERVAL 1 DAY
							),
							'%Y-%m-%d'
						) AS end_date,

						o.status,

						o.notes,

						-- leave_details
						ANY_VALUE(ld.transport)
							AS leave_transport,

						ANY_VALUE(ld.detail)
							AS detail,

						ANY_VALUE(ld.contact)
							AS contact,

						DATE_FORMAT(
							ANY_VALUE(ld.last_outing_start),
							'%Y-%m-%d'
						) AS last_outing_start_date,

						DATE_FORMAT(
							ANY_VALUE(ld.last_outing_end),
							'%Y-%m-%d'
						) AS last_outing_end_date,

						-- outing_details
						ANY_VALUE(od.transport)
							AS outing_transport,

						ANY_VALUE(od.schedule)
							AS schedule,

						GROUP_CONCAT(
							om.name SEPARATOR ','
						) AS members

					FROM outings o

					JOIN users u
					ON u.id = o.user_id

					LEFT JOIN leave_details ld
					ON ld.outing_id = o.id

					LEFT JOIN outing_details od
					ON od.outing_id = o.id

					LEFT JOIN outing_members om
					ON om.outing_id = o.id

					WHERE o.status = 'pending'

					GROUP BY o.id

					ORDER BY o.start_date ASC
          `
      )

      res.json(rows)

    } catch (err) {

      console.error(err)

      res.status(500).json({
        error: "서버 오류"
      })
    }
  }
)

//Search Outings
app.get("/search-outings", authMiddleware, adminOnly, async (req, res) => {

    try {

      const { name } =
        req.query

      const [rows] =
        await pool.query(

          `
					SELECT

						o.id,

						u.name,

						o.reason,

						DATE_FORMAT(
							o.start_date,
							'%Y-%m-%d'
						) AS start_date,

						DATE_FORMAT(
							DATE_SUB(
								o.end_date,
								INTERVAL 1 DAY
							),
							'%Y-%m-%d'
						) AS end_date,

						CASE

							WHEN o.status = 'approved'
								THEN '승인'

							WHEN o.status = 'rejected'
								THEN '반려'

						END AS status,

						o.notes,

						-- leave_details
						ANY_VALUE(ld.transport)
							AS leave_transport,

						ANY_VALUE(ld.detail)
							AS detail,

						ANY_VALUE(ld.contact)
							AS contact,

						DATE_FORMAT(
							ANY_VALUE(ld.last_outing_start),
							'%Y-%m-%d'
						) AS last_outing_start_date,

						DATE_FORMAT(
							ANY_VALUE(ld.last_outing_end),
							'%Y-%m-%d'
						) AS last_outing_end_date,

						-- outing_details
						ANY_VALUE(od.transport)
							AS outing_transport,

						ANY_VALUE(od.schedule)
							AS schedule,

						GROUP_CONCAT(
							om.name SEPARATOR ','
						) AS members

					FROM outings o

					JOIN users u
					ON u.id = o.user_id

					LEFT JOIN leave_details ld
					ON ld.outing_id = o.id

					LEFT JOIN outing_details od
					ON od.outing_id = o.id

					LEFT JOIN outing_members om
					ON om.outing_id = o.id

					WHERE

						u.name LIKE ?

						AND o.end_date >= CURDATE()

						AND (
							o.status = 'approved'
							OR o.status = 'rejected'
						)

					GROUP BY o.id

					ORDER BY o.start_date ASC
          `,

          [`%${name}%`]
      )

      res.json(rows)

    } catch (err) {

      console.error(err)

      res.status(500).json({
        error: "서버 오류"
      })
    }
  }
)

//Status Change (in OMP)
app.patch("/outings/:id/status", authMiddleware, adminOnly, async (req, res) => {

    try {

      const { id } =
        req.params

      const { status } =
        req.body

      await pool.query(

        `
        UPDATE outings
        SET status = ?
        WHERE id = ?
        `,

        [status, id]
      )

      res.json({

        message:
          "상태 변경 완료"
      })

    } catch (err) {

      console.error(err)

      res.status(500).json({

        error:
          "서버 오류"
      })
    }
  }
)

// ========================
// Guard Room
// ========================

app.get('/guard-room', authMiddleware, adminOnly, async (req, res) => {

    try {

      // ========================
      // Senior Guards
      // ========================

      const [seniorGuards] =
        await pool.query(

          `
          SELECT

            gs.id,
            gs.order_no,

            u.id AS user_id,
            u.name,
            u.class_number

          FROM guard_seniors gs

          JOIN users u
          ON u.id = gs.user_id

          ORDER BY gs.order_no ASC
          `
        )


      // ========================
      // Junior Guards
      // ========================

      const [juniorGuards] =
        await pool.query(

          `
          SELECT

            gj.id,
            gj.order_no,

            u.id AS user_id,
            u.name,
            u.class_number

          FROM guard_juniors gj

          JOIN users u
          ON u.id = gj.user_id

          ORDER BY gj.order_no ASC
          `
        )


      // ========================
      // Patients
      // ========================

      const [patients] =
        await pool.query(

          `
          SELECT

            id,
            name,
            unit,
            patient_reason

          FROM users

          WHERE is_patient = 1

          ORDER BY class_number ASC
          `
        )


      // ========================
      // Holidays
      // ========================

      const [holidays] =
        await pool.query(

          `
					SELECT

						id,

						DATE_FORMAT(

							holiday_date,
							'%Y-%m-%d'

						) AS holiday_date,

						reason

					FROM guard_holidays

					ORDER BY holiday_date ASC
          `
        )


      // ========================
      // Guard Schedules
      // ========================

      const [guardSchedules] =
        await pool.query(

          `
					SELECT

						gs.id,

						DATE_FORMAT(
							gs.duty_date,
							'%Y-%m-%d'
						) AS duty_date,

						su.name AS senior_name,

						ju.name AS junior_name

					FROM guard_schedules gs

					JOIN users su
					ON gs.senior_user_id = su.id

					JOIN users ju
					ON gs.junior_user_id = ju.id

					WHERE gs.duty_date >= CURDATE()

					ORDER BY gs.duty_date ASC

					LIMIT 14
          `
        )


      res.json({

        seniorGuards,
        juniorGuards,
        patients,
        holidays,
        guardSchedules
      })

    } catch (err) {

      console.error(err)

      res.status(500).json({

        error:
          '위병소 데이터 조회 실패'
      })
    }
})

// ========================
// Add Holiday
// ========================

app.post('/guard-holidays', authMiddleware, adminOnly, async (req, res) => {

    try {

      const {

        holiday_date,
        reason

      } = req.body


      if (!holiday_date) {

        return res.status(400).json({

          error:
            '휴무일 날짜 누락'
        })
      }


      if (!reason) {

        return res.status(400).json({

          error:
            '휴무 사유 누락'
        })
      }


      await pool.query(

        `
        INSERT INTO guard_holidays (

          holiday_date,
          reason

        )

        VALUES (?, ?)
        `,

        [

          holiday_date,
          reason
        ]
      )


      res.json({

        message:
          '휴무일 추가 완료'
      })

    } catch (err) {

      console.error(err)

      res.status(500).json({

        error:
          '휴무일 추가 실패'
      })
    }
})



// ========================
// Delete Holiday
// ========================

app.delete('/guard-holidays/:id', authMiddleware, adminOnly, async (req, res) => {

    try {

      const { id } =
        req.params


      await pool.query(

        `
        DELETE FROM guard_holidays

        WHERE id = ?
        `,

        [id]
      )


      res.json({

        message:
          '휴무일 삭제 완료'
      })

    } catch (err) {

      console.error(err)

      res.status(500).json({

        error:
          '휴무일 삭제 실패'
      })
    }
})

//listening at 3000
const PORT =
  process.env.PORT || 3000


app.listen(PORT, () => {

  console.log(

    `🚀 서버 실행 중: ${PORT}`
  )
})

// ========================
// Generate Guard Schedule
// ========================

app.post('/generate-guard-schedule', authMiddleware, adminOnly, async (req, res) => {

    try {

      const {

        startDate,
        seniorUserId,
        juniorUserId

      } = req.body

      // ========================
      // Guard Lists
      // ========================

      const [seniorGuards] =
        await pool.query(

          `
          SELECT *

          FROM guard_seniors

          ORDER BY order_no ASC
          `
        )


      const [juniorGuards] =
        await pool.query(

          `
          SELECT *

          FROM guard_juniors

          ORDER BY order_no ASC
          `
        )


      // ========================
      // Initial Guards
      // ========================

      let currentSenior =
        seniorGuards.find(

          g =>
            g.user_id
            == seniorUserId
        )


      let currentJunior =
        juniorGuards.find(

          g =>
            g.user_id
            == juniorUserId
        )


      // ========================
      // Remove Existing
      // ========================

      const endDate =
        new Date(startDate)

      endDate.setDate(
        endDate.getDate() + 13
      )


      const formattedEndDate =
        endDate
          .toISOString()
          .split('T')[0]


      await pool.query(

        `
        DELETE FROM guard_schedules

        WHERE duty_date
        BETWEEN ? AND ?
        `,

        [

          startDate,
          formattedEndDate
        ]
      )


      // ========================
      // Generate
      // ========================

      for (

        let i = 0;
        i < 14;
        i++

      ) {

        const currentDate =
          new Date(startDate)

        currentDate.setDate(

          currentDate.getDate()
          + i
        )


        const targetDate =
          currentDate
            .toISOString()
            .split('T')[0]


        // ========================
        // Weekend
        // ========================

        const day =
          currentDate.getDay()

        const isWeekend =

          day === 0 ||
          day === 6


        // ========================
        // Holiday
        // ========================

        const [holidays] =
          await pool.query(

            `
            SELECT *

            FROM guard_holidays

            WHERE holiday_date = ?
            `,

            [targetDate]
          )


        const isHoliday =
          holidays.length > 0


        // ========================
        // Skip
        // ========================

        if (

          isWeekend ||
          isHoliday

        ) {

          continue
        }


        // ========================
        // Save
        // ========================

        await pool.query(

          `
          INSERT INTO guard_schedules (

            duty_date,
            senior_user_id,
            junior_user_id

          )

          VALUES (?, ?, ?)
          `,

          [

            targetDate,

            currentSenior.user_id,

            currentJunior.user_id
          ]
        )


        // ========================
        // Next Guards
        // ========================

        currentSenior =
          await getNextGuard(

            seniorGuards,

            currentSenior.order_no,

            targetDate
          )


        currentJunior =
          await getNextGuard(

            juniorGuards,

            currentJunior.order_no,

            targetDate
          )
      }


      res.json({

        message:
          '근무표 생성 완료'
      })

    } catch (err) {

      console.error(err)

      res.status(500).json({

        error:
          '근무표 생성 실패'
      })
    }
})

//Save Order API
// ========================
// Save Guard Orders
// ========================

app.put('/guard-orders', authMiddleware, adminOnly, async (req, res) => {

    try {

      const {

        seniorGuards,
        juniorGuards

      } = req.body


      // ========================
      // Seniors
      // ========================

      for (const guard of seniorGuards) {

        await pool.query(

          `
          UPDATE guard_seniors

          SET order_no = ?

          WHERE user_id = ?
          `,

          [

            guard.order_no,

            guard.user_id
          ]
        )
      }


      // ========================
      // Juniors
      // ========================

      for (const guard of juniorGuards) {

        await pool.query(

          `
          UPDATE guard_juniors

          SET order_no = ?

          WHERE user_id = ?
          `,

          [

            guard.order_no,

            guard.user_id
          ]
        )
      }


      res.json({

        message:
          '근무 순번 저장 완료'
      })

    } catch (err) {

      console.error(err)

      res.status(500).json({

        error:
          '근무 순번 저장 실패'
      })
    }
})


//Useful Function
const isAvailableForGuard =
  async (

    userId,
    targetDate

  ) => {

    // ========================
    // Patient Check
    // ========================

    const [patients] =
      await pool.query(

        `
        SELECT *

        FROM users

        WHERE id = ?
        AND is_patient = 1
        `,

        [userId]
      )


    if (patients.length > 0) {

      return false
    }


    // ========================
    // Dispatch Check
    // ========================

    const [dispatches] =
      await pool.query(

        `
        SELECT *

        FROM dispatches

        WHERE user_id = ?

				AND ? BETWEEN
        start_date
        AND end_date
        `,

        [

          userId,
          targetDate
        ]
      )

    if (dispatches.length > 0) {

      return false
    }


    // ========================
    // Outing Check
    // ========================

    const [outings] =
      await pool.query(

        `
        SELECT *

        FROM outings

        WHERE user_id = ?

        AND reason != '외출'

        AND status = 'approved'

				AND ? BETWEEN

				DATE(start_date)

				AND DATE_SUB(

					DATE(end_date),

					INTERVAL 1 DAY
				)
        `,

        [

          userId,
          targetDate
        ]
      )

    if (outings.length > 0) {

      return false
    }


    return true
}

const getNextGuard =
  async (

    guards,
    currentOrder,
    targetDate

  ) => {

    // 현재 index 찾기
    const currentIndex =
      guards.findIndex(

        g =>
          g.order_no
          === currentOrder
      )


    let nextIndex =
      currentIndex


    while (true) {

      // 다음 index
      nextIndex =
        (nextIndex + 1)
        % guards.length


      const guard =
        guards[nextIndex]

			const nextDate =
				new Date(targetDate)

			nextDate.setDate(
				nextDate.getDate() + 1
			)

			const nextTargetDate =
				nextDate
					.toISOString()
					.split('T')[0]


      const available =
        await isAvailableForGuard(

          guard.user_id,
          nextTargetDate
        )


      if (available) {

        return guard
      }
    }
}
