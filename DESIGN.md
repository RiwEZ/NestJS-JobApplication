

```ts
interface User {
    username: string,
    password: string,
```

```ts 
interface Company {
    name: string,
    description: string,
    contactInfo: string,
    admins: MongoId[]
}
```

```ts
interface Job {
    _id: MongoId,
    title: string,
    description: string,
    isOpen: string,
    company: MongoId,
}
```

```ts
interface Applications {
    user: MongoId,
    job: MongoId,
    status: 'hired' | 'rejected'
}
```
