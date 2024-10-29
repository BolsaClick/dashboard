import { getSession } from 'next-auth/react';

export async function requireAdmin(context: any) {
  const session = await getSession(context);

  if (!session || session.user.role !== 'ADMIN') {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
