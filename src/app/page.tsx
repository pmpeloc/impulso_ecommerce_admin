import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default function Home() {
  const session = cookies().get('session')?.value
  redirect(session ? '/dashboard' : '/login')
}
