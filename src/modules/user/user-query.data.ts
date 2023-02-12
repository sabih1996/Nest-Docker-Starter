import { UsersList } from 'src/common/interfaces/user.interface';
import { User } from 'src/db/user.entity';
import { FindOptionsSelect, FindOptionsWhere, ILike, In, Not } from 'typeorm';

export const userListFilter = (
  params: UsersList,
  status: string | boolean,
): FindOptionsWhere<User> => {
  const { firstName, lastName, email, mobileNumber, roles, country } = params;

  const filter = {
    ...{ roles: { role_name: Not('admin') } },
    ...(status && { status: status as boolean }),
    ...(firstName && { firstName: ILike(`%${firstName}%`) }),
    ...(lastName && { lastName: ILike(`%${lastName}%`) }),
    ...(email && { email: ILike(`%${email}%`) }),
    ...(mobileNumber && {
      mobileNumber: ILike(`%${mobileNumber}%`),
    }),
    ...(roles?.length > 0 && { rolesId: In(roles) }),
    ...(country && {
      country: {
        country_name: ILike(`%${country}%`),
      },
    }),
  };

  return filter;
};

export const userExcelFileSelect: FindOptionsSelect<User> = {
  id: true,
  firstName: true,
  lastName: true,
  roles: { role_name: true },
  status: true,
  email: true,
  mobileNumber: true,
};
