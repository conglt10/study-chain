<template>
  <div class="container-fluid" v-loading.fullscreen.lock="fullscreenLoading">
    <h1 class="bannerTitle_1wzmt7u">{{ courseInfo.course ? courseInfo.course.CourseName : '' }}</h1>
    <b-breadcrumb>
      <b-breadcrumb-item to="/student"> <i class="blue fas fa-home"></i>Home </b-breadcrumb-item>
      <b-breadcrumb-item to="/student/courses">Courses</b-breadcrumb-item>
      <b-breadcrumb-item active>{{
        courseInfo.course ? courseInfo.course.CourseName : ''
      }}</b-breadcrumb-item>
    </b-breadcrumb>
    <div class="mb-5">
      <div>
        <div class="card-body">
          <h1 class="h3 mb-2 text-gray-800">About this course</h1>
          <p>{{ courseInfo.course ? courseInfo.course.Description : '' }}</p>
        </div>
      </div>
    </div>
    <b-modal
      id="modal-info"
      ref="modal-info"
      title="Description Subject"
      v-loading.fullscreen.lock="fullscreenLoading"
      ok-only
    >
      <p>{{ infoSubject.description }}</p>
    </b-modal>
    <table-student
      :title="`List Subjects`"
      :listAll="courseInfo.listSubjects"
      :loadingData="loadingData"
      :btnInfo="true"
      :nameFunctionDetail="`detailSubjects`"
      :btnDetail="true"
      :nameFunctionInfo="`modalInfo`"
      :listProperties="[
        { prop: 'SubjectCode', label: 'Subject Code' },
        { prop: 'SubjectName', label: 'Subject Name' },
        { prop: 'ShortDescription', label: 'Short Description' }
      ]"
      @detailSubjects="detailSubject($event)"
      @modalInfo="modalInfo($event)"
    ></table-student>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import TableStudent from '@/components/student/TableStudent';
export default {
  components: {
    ValidationObserver,
    ValidationProvider,
    TableStudent
  },
  data() {
    return {
      items: [
        {
          text: 'Course',
          href: `${process.env.VUE_APP_API_BACKEND}/common/courses`
        },
        {
          text: 'Course Detail',
          active: true
        }
      ],
      course: {
        courseCode: '',
        courseName: '',
        description: ''
      },
      options: [
        {
          value: 'Option1',
          label: 'Option1'
        },
        {
          value: 'Option2',
          label: 'Option2'
        },
        {
          value: 'Option3',
          label: 'Option3'
        },
        {
          value: 'Option4',
          label: 'Option4'
        },
        {
          value: 'Option5',
          label: 'Option5'
        }
      ],
      infoSubject: {
        description: ''
      },
      fullscreenLoading: true,
      loadingData: false
    };
  },
  methods: {
    ...mapActions('student', ['getCourse', 'getSubjectsOfCourse']),
    detailSubject(row) {
      this.$router.push({
        path: `/student/courses/${this.$route.params.id}/subject/${row.SubjectID}`
      });
    },
    modalInfo(row) {
      this.infoSubject.description = row.Description;
      this.$root.$emit('bv::show::modal', 'modal-info');
    }
  },
  computed: {
    ...mapState('student', ['listSubjects', 'listCourses', 'courseInfo'])
  },
  async created() {
    let course = await this.getCourse(this.$route.params.id);
    if (course) {
      this.fullscreenLoading = false;
    }
  }
};
</script>
<style scoped>
.el-select {
  width: 100%;
}
.bannerTitle_1wzmt7u {
  font-family: 'OpenSans-Bold', Arial, sans-serif;
  font-size: 34px;
  line-height: 46px;
  font-weight: 700;
  margin-top: 24px;
  margin-bottom: 24px;
  color: blue;
}
</style>
