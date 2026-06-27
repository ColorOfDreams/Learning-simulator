import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';

export async function createClass(data: ClassroomsAPI.CreateClassDto) {
  return axios.post(`${ip3}/classrooms`, data);
}

export async function getTeacherClasses() {
  return axios.get(`${ip3}/classrooms/teacher`);
}

export async function getClassById(id: string) {
  return axios.get(`${ip3}/classrooms/${id}`);
}

export async function deleteClass(id: string) {
  return axios.delete(`${ip3}/classrooms/${id}`);
}

export async function joinClass(data: ClassroomsAPI.JoinClassDto) {
  return axios.post(`${ip3}/classrooms/join`, data);
}

export async function updateMemberStatus(classId: string, memberId: string, status: 'APPROVED' | 'REJECTED') {
  return axios.patch(`${ip3}/classrooms/${classId}/members/${memberId}`, { status });
}

export async function createAssignment(classId: string, data: ClassroomsAPI.CreateAssignmentDto) {
  return axios.post(`${ip3}/classrooms/${classId}/assignments`, data);
}

export async function submitAssignment(assignmentId: string, data: ClassroomsAPI.SubmitAssignmentDto) {
  return axios.post(`${ip3}/classrooms/assignments/${assignmentId}/submit`, data);
}

export async function getStudentClasses() {
  return axios.get(`${ip3}/classrooms/student/me`);
}
