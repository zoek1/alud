# Alud

Story telling for the tezos Blockchain using the dipdup indexers.


## Setup

Clone the repository and enter the alud subdirectory.

```
git clone https://github.com/zoek1/alud.git
cd alud/alud
```

Install depencies using yarn.

```
yarn
```

## Run

Start the client server using yarn.

```
yarn start
```


## Backlog

- [X] Add support to query dipdup graphql endpoint
- [X] Integrate graphiql and the graphiql explorer to speed the query design process
- [X] Integrate JSONata to support selection and aggregation on indexed data.
- [X] Integrate charts.js to display the filtered data.
- [X] Integrate markdown editor to explain motivation behind the charts
- [ ] Save charts in the servers.
- [ ] Display all created charts.
- [ ] Add support for dashboards

## Create a new tezos Viz

1. Query and filter data available in the dipdup indexer
![](screenshots/query.png)

2. Select the chart type and customize it
![](screenshots/config.png)

3. Write some story or context about your chart
![](screenshots/story.png)

4. Save it! 

## License

See [LICENSE](LICENSE.md).
