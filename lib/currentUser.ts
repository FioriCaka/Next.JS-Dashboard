import { getSession } from '@/lib/auth';

export async function currentUser() {
  return getSession();
}
