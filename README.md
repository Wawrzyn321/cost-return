# The background

I like to play squash, but renting a racket everytime amounts to a lot of money, so I bought me a pretty decent squash racket. It's an investment, so when it returns?

# The idea

I want to keep track of each and every "payoff" of an single "investment", so I know when the COST is RETURNED.

# The requirements

- Handle multiple users
- Handle multiple "investments"
- Sharing "investment" progress via magic links 

# The structure

- Frontend: SolidJS with TailwindCSS & DaisyUI, w a c k y  a n i m a t i o n s
- Backend: Flask - a one-file proxy, with one custom endpoint (for login)
- Database: Pocketbase

# The details
 
- [Frontend](./frontend/README.md)
- [Backend](./backend/README.md)
- Database models:
    - `Collection` - a model of an "investment", contains the owner reference, initial amount and a name.
    - `CollectionEntry` - a model for single payment, contains collection reference, cash amount and a comment.
    - Users are kept as a default "User" Pocketbase collection.