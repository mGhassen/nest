import LoginClient from './LoginClient';

export default async function Page(props: any) {
  const searchParams = await props.searchParams;
  return <LoginClient searchParams={searchParams} />;
}
