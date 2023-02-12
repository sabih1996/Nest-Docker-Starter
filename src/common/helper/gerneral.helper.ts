import { HttpException, HttpStatus } from '@nestjs/common';

export function randomizeLastLetter(oldString: string): string {
  const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randomLetter = alphabets[Math.floor(Math.random() * alphabets.length)];

  const newString = oldString.substring(0, oldString.length - 1) + randomLetter;

  return newString;
}

export function randomString(length: number): string {
  const randomLetters = (Math.random() + 1).toString(36).substring(length + 2);

  return randomLetters;
}

export function verifyDates(startDate: Date, endDate: Date) {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  if (
    new Date(startDate).getTime() < currentDate.getTime() ||
    new Date(endDate).getTime() < currentDate.getTime()
  ) {
    throw new HttpException('Date exceeded', HttpStatus.CONFLICT);
  }
}
