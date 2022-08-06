# NFT Launchpad
NFT Launchpad built by reverse engineering candy machine CLI's source code along with Strata protocol's dynamic pricing mint implemented.

# Setup
1. Clone the repository: `git clone https://github.com/solrazr-app/nft-launchpad.git`

2. Go to [Twitter developer portal](https://developer.twitter.com) and created a project

3. Enable OAuth2

4. Add the following values in the local `.env` file:
```
NEXTAUTH_URL=...
NEXTAUTH_SECRET=...
NEXT_PUBLIC_STORAGE_KEY=...
TWITTER_CONSUMER_KEY=...
TWITTER_CONSUMER_SECRET=...
TWITTER_ACCESS_TOKEN=...
API_URL=...
DATABASE_URL=...
```

5. Run yarn to install all modules then make database migrations
```yarn && yarn prisma generate```

6. Start the development server
```yarn dev```