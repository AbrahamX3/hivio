export default function PublicUserProfile({
  params,
}: {
  params: { userId: string };
}) {
  return <div>UserProfile: {params.userId}</div>;
}
