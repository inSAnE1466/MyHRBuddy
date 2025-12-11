export function getInitials(firstName: string, lastName: string | null = null): string {
  return `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();
}
