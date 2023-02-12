export interface User {
  id?: number;
  username: string;
  password: string;
}

export interface UsersList {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  roles: number[];
  country?: string;
}
