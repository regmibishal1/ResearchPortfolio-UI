/** An unsigned JWT-shaped token for tests; the UI only ever reads its payload. */
export function fakeJwt(claims: Record<string, unknown>): string {
  const encode = (o: unknown) =>
    btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${encode({ alg: 'HS256' })}.${encode(claims)}.sig`
}
