# Batching
N + 1 problem does not exist in this implementation.

## Run the following graphql query. 
```graphql
query {
  queryPost(
    where: { id: { gt: "1" } }
    offset: 0
    limit: 3
    orderBy: { column: "id", order: "asc" }
  ) {
    id
    title
    author {
      email
      company {
        domain
      }
    }
  }
}
```

You should be able to see result similar to the following.
```json
{
  "data": {
    "queryPost": [
      {
        "id": "2",
        "title": "Eos exercitationem inventore iusto sed.",
        "author": {
          "email": "Gilberto.Rogahn35@gmail.com",
          "company": {
            "domain": "dulce.info"
          }
        }
      },
      {
        "id": "3",
        "title": "Hic illum corrupti quia atque adipisci quaerat ut harum veritatis.",
        "author": {
          "email": "Alia.Emmerich13@hotmail.com",
          "company": {
            "domain": "mozell.info"
          }
        }
      },
      {
        "id": "4",
        "title": "Voluptatem consequatur ducimus fugit magnam molestiae.",
        "author": {
          "email": "Alia.Emmerich13@hotmail.com",
          "company": {
            "domain": "mozell.info"
          }
        }
      }
    ]
  }
}
```

## Let's check the queries excuted
In the backend, 3 queries are executed, one for Post, one for Author and one for company. We will explain more details about how N+1 problems is avoided in the library.
```sh
[nodemon] restarting due to changes...
[nodemon] starting `node example/index.js`
🚀  Server ready at http://localhost:4000/
----------  LIST QUERY (Post) ---------
 select "id", "title", "author_id" from "posts" where "id" > '1' order by "id" asc limit 3

----------  LIST QUERY (Author) ---------
 select "email", "company_id", "id" from "authors" where "id" in ('9', '5') limit 2

----------  LIST QUERY (Company) ---------
 select "domain", "id" from "companies" where "id" in ('4', '7') limit 2
```