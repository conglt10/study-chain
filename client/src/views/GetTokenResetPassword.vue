<script>
import { mapState, mapActions } from 'vuex';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
export default {
  name: 'getToken',
  components: {
    ValidationObserver,
    ValidationProvider
  },
  data() {
    return {
      loading: true
    };
  },
  computed: {
    ...mapState('account', ['status']),
    ...mapState({
      alert: (state) => state.alert
    })
  },
  methods: {
    ...mapActions('account', ['getTokenResetPassword'])
  },
  async created() {
    let token = `${this.$route.params.token}`;
    let response = await this.getTokenResetPassword(token);
    if (response) {
      this.$router.push({ path: `/resetPassword` });
    }
  }
};
</script>
