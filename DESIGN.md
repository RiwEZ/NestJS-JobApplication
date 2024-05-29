
We have 2 side of user
1. Normal user who is looking for jobs
2. Company user who is looking to hired


## Normal User
```ts
interface UserAuth {
    _id;
    username: string,
    password: string,
```
```ts
interface UserInfo {
    info: string
    owner: CompanyAuthId
}
```

## Company User
```ts 
interface CompanyAuth {
    _id;
    username: string,
    password: string,
```

```ts
interface CompanyInfo {
    name: string,
    description: string,
    contactInfo: string,
    owner: CompanyAuthId
}
```

## Job 
```ts
interface Job {
    _id: MongoId,
    title: string,
    description: string,
    isOpen: string,
    company: MongoId,
}
```

## Applicant
```ts
interface Applications {
    user: MongoId,
    job: MongoId,
    status: 'hired' | 'rejected' | 'pending'
}
```
