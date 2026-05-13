import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL

// Leave schedule Check
export const getOutings = (token) => {
  return axios.get(`${API_URL}/outings`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// Leave Registration
export const createOuting = (token, data) => {
  return axios.post(`${API_URL}/outings`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

//Leave Registration Correction API
export const updateOuting =
  async (token, id, data) => {

    const res = await axios.patch(

      `${API_URL}/outings/${id}`,

      data,

      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    return res.data
}

// Delete Schedule
export const deleteOuting = (token, id) => {
  return axios.delete(`${API_URL}/outings/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

//Schedule Management
export const getOutingDetail = async (token, id) => {
  const res = await axios.get(`${API_URL}/outings/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res;
};

//Leave Percentage API
export const getOutingRate = async (token) => {

  const res = await axios.get(
    `${API_URL}/outing-rate`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return res;
};

//Admin approve API
export const updateOutingStatus = async (
  id,
  status,
  token
) => {

  return axios.put(
    `${API_URL}/admin/outings/${id}`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};

//Dispatch API
export const createDispatchOuting =
  async (data) => {

    const token =
      localStorage.getItem("token")

    const res = await axios.post(

      `${API_URL}/dispatches`,

      data,

      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    return res.data
}

//CMM API
export const getUsers = async () => {

  const token =
    localStorage.getItem("token")

  const res = await axios.get(

    `${API_URL}/users`,

    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  return res.data
}

//Correction Modal API
export const updateUser = async (data) => {

  const token =
    localStorage.getItem("token")

  const res = await axios.patch(

    `${API_URL}/users/${data.id}`,

    data,

    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  return res.data
}

//Add User API
export const createUser = async (data) => {

  const token =
    localStorage.getItem("token")

  const res = await axios.post(

    `${API_URL}/users`,

    data,

    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  return res.data
}

//Patient Count API
export const getPatientCount =
  async () => {

    const token =
      localStorage.getItem("token")

    const res = await axios.get(

      `${API_URL}/patients/count`,

      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    return res.data
}

//Dispatch Count API
export const getDispatchCount =
  async () => {

    const token =
      localStorage.getItem("token")

    const res = await axios.get(

      `${API_URL}/dispatches/count`,

      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    return res.data
}

//Current Outing Count API
export const getCurrentOutingCount =
  async () => {

    const token =
      localStorage.getItem("token")

    const res = await axios.get(

      `${API_URL}/outings-current-count`,

      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    return res.data
}

//Pending Count API
export const getPendingOutingCount =
  async () => {

    const token =
      localStorage.getItem("token")

    const res = await axios.get(

      `${API_URL}/outings-pending-count`,

      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    return res.data
}

//Delete User API
export const deleteUser =
  async (token, id) => {

    const res = await axios.delete(

      `${API_URL}/users/${id}`,

      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    return res.data
}

//CompanyRoster API
export const getCompanyRoster =
  async (token, date) => {

    const res = await axios.get(

      `${API_URL}/company-roster?date=${date}`,

      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    )

    return res.data
}

//OutingRoster API
export const getOutingRoster =
  async (token, date) => {

    const res = await axios.get(

      `${API_URL}/outing-roster?date=${date}`,

      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    )

    return res.data
}

// ========================
// Dispatch List
// ========================

export const getDispatchList =
  async (token) => {

    const res = await axios.get(

      `${API_URL}/dispatch-list`,

      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    )

    return res.data
}

// ========================
// Delete Dispatch
// ========================

export const deleteDispatch =
  async (token, id) => {

    const res = await axios.delete(

      `${API_URL}/dispatches/${id}`,

      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    )

    return res.data
}

// ========================
// Pending Outings
// ========================

export const getPendingOutings =
  async (token) => {

    const res = await axios.get(

      `${API_URL}/pending-outings`,

      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    )

    return res.data
}

// ========================
// Search Outings
// ========================

export const searchOutings =
  async (token, name) => {

    const res = await axios.get(

      `${API_URL}/search-outings?name=${name}`,

      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    )

    return res.data
}

//Status Change (in OMP)
export const updateOutingStat =
  async (
    token,
    outingId,
    status
  ) => {

    const res = await axios.patch(

      `${API_URL}/outings/${outingId}/status`,

      { status },

      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    )

    return res.data
}

//guardroom API
export const getGuardRoom =
  async (token) => {

    const res =
      await axios.get(

        `${API_URL}/guard-room`,

        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      )

    return res.data
}

//Holiday API
export const addGuardHoliday =
  async (

    token,
    holidayData

  ) => {

    const res =
      await axios.post(

        `${API_URL}/guard-holidays`,

        holidayData,

        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      )

    return res.data
}



export const deleteGuardHoliday =
  async (

    token,
    id

  ) => {

    const res =
      await axios.delete(

        `${API_URL}/guard-holidays/${id}`,

        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      )

    return res.data
}

//Duty Schedule API
export const generateGuardSchedule =
  async (

    token,
    scheduleData

  ) => {

    const res =
      await axios.post(

        `${API_URL}/generate-guard-schedule`,

        scheduleData,

        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      )

    return res.data
}

//Save Order API
export const saveGuardOrders =
  async (

    token,

    seniorGuards,
    juniorGuards

  ) => {

    const res =
      await axios.put(

        `${API_URL}/guard-orders`,

        {

          seniorGuards,
          juniorGuards
        },

        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      )

    return res.data
}


