<template>
  <div class="container login-container">
    <div class="row justify-content-center">
      <div class="col-md-6 login-form-2">
        <h3>Reset your password</h3>
        <ValidationObserver ref="observer" v-slot="">
          <b-form @submit="onSubmit" @reset="onReset">
            <div v-if="alert.message" :class="`text-center alert ${alert.type}`">
              {{ alert.message }}
            </div>
            <ValidationProvider rules="required|email" name="Email" v-slot="{ valid, errors }">
              <b-form-group label-for="Email">
                <b-form-input
                  type="email"
                  v-model="form.email"
                  :state="errors[0] ? false : valid ? true : null"
                  placeholder="email"
                ></b-form-input>
                <b-form-invalid-feedback id="inputLiveFeedback">{{
                  errors[0]
                }}</b-form-invalid-feedback>
              </b-form-group>
            </ValidationProvider>
            <button type="submit" class="col-6 btnSubmit offset-3">Send Password Reset</button>
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
  name: 'forgotPassword',
  components: {
    ValidationObserver,
    ValidationProvider
  },
  data() {
    return {
      form: {
        email: ''
      }
    };
  },
  computed: {
    ...mapState('account', ['status']),
    ...mapState({
      alert: (state) => state.alert
    })
  },
  methods: {
    ...mapActions('account', ['forgotPassword']),
    onSubmit(e) {
      e.preventDefault();
      const { email } = this.form;
      if (email) {
        this.forgotPassword({ email });
      }
    },
    onReset() {
      this.form.email = '';
    }
  },
  created() {}
};
</script>
