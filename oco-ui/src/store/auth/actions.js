import * as types from "./actionTypes"
import authService from "../../services/auth"
import * as errorActions from "../error/actions"


export function checkWhiteList() {
  return async (dispatch, getState, socket) => {
    try {
      const result = await authService.checkWhiteList()
      dispatch({ type: types.SET_WHITELIST_STATUS, status: Boolean(result) })
      if (result) {
        console.log("Verified whitelist")
        dispatch(fetchOktaConfig())
        if (!getState().socket.connected) {
          console.log("Connecting")
          socket.connect()
        }
      } else {
        console.log("Whitelist rejected, disconnecting")
        socket.disconnect()
      }
    } catch (error) {
      dispatch({ type: types.SET_WHITELIST_ERROR, error: error.message })
    }
  }
}

export function whitelist(token) {
  return async (dispatch, getState, socket) => {
    try {
      await authService.whitelist(token)
      dispatch({ type: types.SET_WHITELIST_STATUS, status: true })
      dispatch(fetchOktaConfig())
      if (!getState().socket.connected) {
        console.log("Connecting")
        socket.connect()
      }
    } catch (error) {
      dispatch({ type: types.SET_WHITELIST_ERROR, error: error.message })
    }
  }
}

export function clearWhitelist() {
  return async (dispatch, getState, socket) => {
    try {
      await authService.clearWhiteList()
      dispatch({ type: types.SET_WHITELIST_STATUS, status: false })
      socket.disconnect()
    } catch (error) {
      dispatch({ type: types.SET_WHITELIST_ERROR, error: error.message })
    }
  }
}

export function fetchOktaConfig() {
  return wrappedRequest(
    () => authService.config(),
    config => ({ type: types.SET_OKTA_CONFIG, config }),
    error =>
      errorActions.addBackground(
        "Could not fetch authentication data: " + error.message,
        "auth-config",
        "auth"
      )
  )
}

export function logout() {
  return (dispatch, getState, socket) => {
    dispatch({ type: types.LOGOUT })
    socket.disconnect()
  }
}

export function setToken(token, userName) {
  return (dispatch, getState, socket) => {
    dispatch({ type: types.SET_TOKEN, token, userName })
    socket.connect()
  }
}

export function invalidateLogin() {
  return (dispatch, getState, socket) => {
    dispatch({ type: types.INVALIDATE_LOGIN })
    socket.disconnect()
  }
}

export function handleHttpResponse(response) {
  if (response.status === 403) {
    return { type: types.SET_WHITELIST_EXPIRED }
  } else if (response.status === 401) {
    return invalidateLogin()
  }
  return null
}

export function wrappedRequest(
  apiRequest,
  jsonHandler,
  errorHandler,
  onSuccess
) {
  return async (dispatch, getState) => {
    dispatchWrappedRequest(
      getState().auth,
      dispatch,
      apiRequest,
      jsonHandler,
      errorHandler,
      onSuccess
    )
  }
}

export async function dispatchWrappedRequest(
  auth,
  dispatch,
  apiRequest,
  jsonHandler,
  errorHandler,
  onSuccess
) {
  try {
    // Don't dispatch API requests if we're not authenticated.
    if (!auth.whitelisted || !auth.loggedIn) {
      return
    }

    // Dispatch the request
    const response = await apiRequest(auth)

    if (!response.ok) {
      // Check if the response is an authentication error
      const authAction = handleHttpResponse(response)
      if (authAction !== null) {
        // If so, handle it accordingly
        dispatch(authAction)
      } else {
        // Otherwise, it's an unexpected error
        throw new Error(
          response.statusText
            ? response.statusText
            : "Server error (" + response.status + ")"
        )
      }
    } else {
      if (onSuccess) dispatch(onSuccess())
      if (jsonHandler) dispatch(jsonHandler(await response.json()))
    }
  } catch (error) {
    if (errorHandler) dispatch(errorHandler(error))
  }
}