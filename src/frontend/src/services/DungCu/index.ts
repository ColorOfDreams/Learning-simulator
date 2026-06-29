import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';

export async function layDanhSachDungCu(loc?: { monHoc?: string; lop?: number }) {
  return axios.get(`${ip3}/equipment`, { params: loc });
}

export async function layChiTietDungCu(id: string) {
  return axios.get(`${ip3}/equipment/${id}`);
}

export async function themDungCu(data: Partial<DungCu.IRecord>) {
  return axios.post(`${ip3}/equipment`, data);
}

export async function suaDungCu(id: string, data: Partial<DungCu.IRecord>) {
  return axios.put(`${ip3}/equipment/${id}`, data);
}

export async function xoaDungCu(id: string) {
  return axios.delete(`${ip3}/equipment/${id}`);
}
