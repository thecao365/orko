import React from "react"

import { Icon } from "semantic-ui-react"
import ReactTable from "react-table"

import Link from "../components/primitives/Link"
import Href from "../components/primitives/Href"
import Price from "../components/primitives/Price"

const textStyle = {
  textAlign: "left"
}

const numberStyle = {
  textAlign: "right"
}

const exchangeColumn = {
  id: "exchange",
  Header: "Exchange",
  accessor: "exchange",
  Cell: ({ original }) => (
    <Link to={"/coin/" + original.key} title="Open coin">
      {original.exchange}
    </Link>
  ),
  headerStyle: textStyle,
  style: textStyle,
  resizable: true,
  minWidth: 42
}

const nameColumn = {
  id: "name",
  Header: "Name",
  accessor: "shortName",
  Cell: ({ original }) => (
    <Link to={"/coin/" + original.key} title="Open coin">
      {original.shortName}
    </Link>
  ),
  headerStyle: textStyle,
  style: textStyle,
  resizable: true,
  minWidth: 48
}

const priceColumn = {
  id: "price",
  Header: "Price",
  Cell: ({ original }) => (
    <Price coin={original} bare>
      {original.ticker ? original.ticker.last : undefined}
    </Price>
  ),
  headerStyle: numberStyle,
  style: numberStyle,
  resizable: true,
  minWidth: 50,
  sortable: false
}

const changeColumn = onClick => ({
  id: "change",
  Header: "Change",
  accessor: "change",
  Cell: ({ original }) => (
    <Href
      color={original.priceChange.slice(0, 1) === "-" ? "sell" : "buy"}
      onClick={() => onClick(original)}
      title="Set reference price"
    >
      {original.priceChange}
    </Href>
  ),
  headerStyle: numberStyle,
  style: numberStyle,
  resizable: true,
  minWidth: 40
})

const closeColumn = onRemove => ({
  id: "close",
  Header: null,
  Cell: ({ original }) => (
    <Href title="Remove coin" onClick={() => onRemove(original)}>
      <Icon fitted name="close" />
    </Href>
  ),
  headerStyle: textStyle,
  style: textStyle,
  width: 32,
  sortable: false,
  resizable: false
})

const alertColumn = onClickAlerts => ({
  id: "alert",
  Header: <Icon fitted name="bell outline" />,
  Cell: ({ original }) => (
    <Href title="Manage alerts" onClick={() => onClickAlerts(original)}>
      <Icon fitted name={original.hasAlert ? "bell" : "bell outline"} />
    </Href>
  ),
  headerStyle: textStyle,
  style: textStyle,
  width: 32,
  sortable: false,
  resizable: false
})

const Coins = ({ data, onRemove, onClickAlerts, onClickReferencePrice }) => (
  <ReactTable
    data={data}
    columns={[
      closeColumn(onRemove),
      exchangeColumn,
      nameColumn,
      priceColumn,
      changeColumn(onClickReferencePrice),
      alertColumn(onClickAlerts)
    ]}
    showPagination={false}
    resizable={false}
    className="-striped"
    minRows={0}
    noDataText="Add a coin by clicking +, above"
    defaultPageSize={1000}
  />
)

export default Coins