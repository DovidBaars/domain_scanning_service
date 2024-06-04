#!/bin/sh
npx prisma migrate dev
npx prisma generate
npm run start