<template>
  <div class="container login-container">
    <div class="row justify-content-center">
      <div class="col-md-6 login-form-2">
        <h3>Reset Your Password</h3>
        <ValidationObserver ref="observer" v-slot="">
          <b-form @submit="onSubmit" @reset="onReset">
            <div v-if="alert.message" :class="`text-center alert ${alert.type}`">
              {{ alert.message }}
            </div>
            <ValidationProvider
              rules="required|min:6"
              name="New Password"
              v-slot="{ valid, errors }"
            >
              <b-form-group label-for="New Password">
                <b-form-input
                  type="password"
                  v-model="form.password"
                  :state="errors[0] ? false : valid ? true : null"
                  placeholder="New Password"
                ></b-form-input>
                <b-form-invalid-feedback id="inputLiveFeedback">{{
                  errors[0]
                }}</b-form-invalid-feedback>
              </b-form-group>
            </ValidationProvider>
            <ValidationProvider
              rules="required|min:6"
              name="Confirm Password"
              vid="confirmPassword"
              v-slot="{ valid, errors }"
            >
              <b-form-group label-for="Confirm Password">
                <b-form-input
                  type="password"
                  v-model="form.confirmPassword"
                  :state="errors[0] ? false : valid ? true : null"
                  placeholder="Confirm Password"
                ></b-form-input>
                <b-form-invalid-feedback id="inputLiveFeedback">{{
                  errors[0]
                }}</b-form-invalid-feedback>
              </b-form-group>
            </ValidationProvider>
            <button type="submit" class="col-6 btnSubmit">Reset Password</button>
          </b-form>
        </ValidationObserver>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
export default {
  name: 'resetPassword',
  components: {
    ValidationObserver,
    ValidationProvider
  },
  data() {
    return {
      form: {
        password: '',
        confirmPassword: ''
      }
    };
  },
  computed: {
    ...mapState('account', ['token']),
    ...mapState({
      alert: (state) => state.alert
    })
  },
  methods: {
    ...mapActions('account', ['resetPassword']),
    onSubmit(e) {
      e.preventDefault();
      const { confirmPassword, password } = this.form;

      console.log(`${token}----------`);
      if (confirmPassword && password) {
        this.resetPassword({ password, confirmPassword, token });
      }
    },
    onReset() {
      this.form.password = '';
      this.form.confirmPassword = '';
    }
  },
  created() {}
};
</script>
