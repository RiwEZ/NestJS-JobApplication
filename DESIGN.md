## Note
For this task, I mostly try to implement everything first before thinking about the design and
refactor the code because I never used NestJS and GraphQL so many things will be rough on the edge.

## Design Overview
User can be divided to 2 groups 
1. Candidate user who is looking for jobs.
2. Company user who is looking to hired someone.

![g_postscheduler](https://github.com/RiwEZ/NestJS-JobApplication/assets/55591062/70e1e27a-ffd8-4b9c-92f8-a80d4a4ef8b8)

We will have 6 modules.
1. `auth` for handling authentication and role guard for specific thing that 
company can do but candidate cannot, and on the other hand too.
2. `user` for handling user creating user and finding user.
3. `candidate` for handling all candidate actions.
4. `company` for handling all company actions.
5. `jobs` for handling all job actions.
6. `applicants` for handling all applicant actions.

with 5 MongoDB collections.
![g_postscheduler (1)](https://github.com/RiwEZ/NestJS-JobApplication/assets/55591062/26ddff8d-9294-4e2f-b336-b24c01a552c8)
Actually, maybe we can store the candidate and company information on the user collections too, 
but this may make the collection harder to maintain because we have 2 types of data in the same 
collection. (but if we want to, we can do it and reduce the database query)

For the database schema you can checkout each module `.schema.ts` file for full details.

And lastly, I also write a simple e2e test on the test folder, you can check it out to know 
how the whole thing work from there. And if you want to try using it after the e2e test is finished,
remove the `docker compose down` from `package.json` `test:e2e` script to make the MongoDB still up
and run `pnpm start` after that to interact with the app with some data.


## Applicant flow
1. Register as a user through `/auth/register` with body
    ```
    {
        "username": "username",
        "password": "password",
        "kind": "candidate"
    }
    ```
2. Register as a candidate through `registerCandidate` mutation in graphql
3. Check for jobs through `jobs` query in graphql
4. Apply to a job through `applyTo` mutation in graphql
5. Check for application status through `applicationStatuses` query in graphql

**Others**
- Candidate can find jobs through `companies` query in graphql too, this can help to find jobs from 
a specific company
- Candidate can check their profile through `candiateProfile` query
- Candidate can edit their profile through `editCandidate` mutation in graphql

## Company flow
1. Register as a user through `/auth/register` with body
    ```
    {
        "username": "username",
        "password": "password",
        "kind": "company"
    }
    ```
2. Register as a company through `registerCompany` mutation in graphql
3. Create job through `createJob` mutation in graphql
4. Check for applicants of each job through `applicants` query in graphql
5. Hire or Reject an applicant through `hire` and `reject` mutation in graphql
6. Close a job through `toggleJobStatus` mutation in graphql

**Others**
- Company can delete job through `deleteJob` mutation in graphql
- Company can check their profile through `companyProfile` query in graphql
- Company can edit their profile through `editCompnay` mutation in graphql
