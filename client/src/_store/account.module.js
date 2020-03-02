import { authService } from '../_services/auth.service';
import { router } from '../router';

const user = JSON.parse(localStorage.getItem('user'));
const state = user
  ? {
      status: { loggedIn: true },
      user
    }
  : {
      status: {},
      user: null
    };

const actions = {
  login({ dispatch, commit }, { username, password }) {
    commit('loginRequest', { username });
    authService.login(username, password).then(
      (user) => {
        commit('loginSuccess', user);
        router.push('/home');
      },
      (error) => {
        commit('loginFailure', error);
        dispatch('alert/error', error, { root: true });
      }
    );
  },
  register({ dispatch, commit }, user) {
    commit('registerRequest', user);
    authService.register(user).then(
      (data) => {
        commit('registerSuccess');
        router.push('/login');
        setTimeout(() => {
          dispatch('alert/success', 'Registration successful', { root: true });
        });
      },
      (error) => {
        commit('registerFailure');
        dispatch('alert/error', error, { root: true });
      }
    );
  },
  forgotPassword({ dispatch, commit }, { email }) {
    commit('sendEmailRequest', { email });
    authService.forgotPassword(email).then(
      (user) => {
        commit('sendEmailRequest', user);
        router.push('/resetPassword');
      },
      (error) => {
        commit('sendEmailFailure', error);
        dispatch('alert/error', error, { root: true });
      }
    );
  },
  getTokenResetPassword({ dispatch, commit }, token) {
    authService.getTokenResetPassword(token).then(
      (result) => {
        commit('getTokenRequest', token);
        router.push('/resetPassword');
      },
      (error) => {
        dispatch('alert/error', error, { root: true });
      }
    );
  },
  resetPassword({ dispatch }, { password, confirmPassword, token }) {
    authService.resetPassword(password, confirmPassword, token).then(
      (user) => {
        router.push('/login');
      },
      (error) => {
        dispatch('alert/error', error, { root: true });
      }
    );
  },

  logout({ commit }) {
    authService.logout();
    commit('logout');
    router.push('/login');
  },

  loginGoogle({ dispatch, commit }, code) {
    authService.loginGoogle(code).then(
      (user) => {
        commit('loginSuccess', user);
        router.push('/home');
      },
      (error) => {
        commit('loginFailure', error);
        dispatch('alert/error', error, { root: true });
      }
    );
  },
  async getProfile() {
    try {
      let info = await authService.getProfile();
      return info;
    } catch (error) {
      console.log(error);
      if (error.response.status === 403) {
        router.push('/403');
      }
    }
  },
  async pushProfile({}, user) {
    try {
      let data = await authService.pushProfile(user);
      return data;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
      return error.response.data;
    }
  },
  async changePass({}, changePass) {
    try {
      let data = await authService.changePass(changePass);
      return data;
    } catch (error) {
      if (error.response.status === 403) {
        router.push('/403');
      }
      return error.response.data;
    }
  }
};

const mutations = {
  loginRequest(state, user) {
    state.status = { loggingIn: true };
    state.user = user;
  },
  loginSuccess(state, user) {
    state.status = { loggedIn: true };
    state.user = user;
  },
  loginFailure(state) {
    state.status = {};
    state.user = null;
  },
  registerRequest(state, user) {
    state.status = { registering: true };
  },
  registerSuccess(state) {
    state.status = {};
  },
  registerFailure(state) {
    state.status = {};
  },
  sendEmailRequest(state, user) {
    state.status = { forgotPassword: true };
  },
  sendEmailSuccess(state) {
    state.status = {};
  },
  sendEmailRequestFailure(state) {
    state.status = {};
  },
  getTokenRequest(state, token) {
    state.token = { token };
  },
  logout(state) {
    state.status = {};
    state.user = null;
    state.token = null;
  }
};

//

export const account = {
  namespaced: true,
  state,
  actions,
  mutations
};
