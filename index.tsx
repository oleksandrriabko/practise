import React from "react";
import {
  Row,
  Col,
  Table,
  Typography,
  Button,
  Divider,
  Pagination,
  Empty,
} from "antd";
import { TableProps } from "antd/es/table";
import moment from "moment";
import InputRenderer from "./filters/input";
import SelectRenderer from "./filters/select";
import MultiSelectRenderer from "./filters/select";
import RangePickerRenderer from "./filters/rangepicker";
import _ from "lodash";

type appliedFilter = {
  filterFunction: any;
};

interface FilterableTableState {
  initialDataSource: any[];
  filteredDataSource: any[];
  columns: any[];
  appliedFilters: appliedFilter[];
}

interface IProps extends TableProps<any> {
  noPagination?: any;
}
const { Text } = Typography;

class FilterableTable extends React.Component<IProps, FilterableTableState> {
  public state = {
    initialDataSource: [],
    filteredDataSource: [],
    columns: [],
    appliedFilters: [],
  };

  private PropsParserToFilter = {
    input: (column: any) => {
      const payload = {
        key: column.key,
        onChange: (e: any) => {
          const newFilter: appliedFilter = {
            filterFunction: (dataItem: any) => {
              return dataItem[column.dataIndex].includes(e.target.value);
            },
          };
          const appliedFilters: appliedFilter[] = this.state.appliedFilters;
          appliedFilters[column.dataIndex] = newFilter;
          this.setState({ appliedFilters });
          this.filterTable();
        },
      };
      return InputRenderer(payload);
    },
    select: (column: any) => {
      const payload = {
        key: column.key,
        options: this.state.initialDataSource.map((dataItem: any) => {
          return {
            key: dataItem[column.dataIndex],
            value: dataItem[column.dataIndex],
            label: dataItem[column.dataIndex],
          };
        }),
        onChange: (e: any) => {
          const newFilter: appliedFilter = {
            filterFunction: (dataItem: any) => {
              console.log("dataItem", dataItem);
              return String(dataItem[column.dataIndex]).includes(String(e));
            },
          };
          const appliedFilters: appliedFilter[] = this.state.appliedFilters;
          appliedFilters[column.dataIndex] = newFilter;
          this.setState({ appliedFilters });
          this.filterTable();
        },
      };
      return SelectRenderer(payload);
    },
    multiselect: (column: any) => {
      const payload = {
        key: column.key,
        options: this.state.initialDataSource.map((dataItem: any) => {
          return {
            key: dataItem[column.dataIndex],
            value: dataItem[column.dataIndex],
            label: dataItem[column.dataIndex],
          };
        }),
        mode: "multiple",
        onChange: (e: any) => {
          const newFilter: appliedFilter = {
            filterFunction: (dataItem: any) => {
              return e.includes(dataItem[column.dataIndex]) || e.length === 0;
            },
          };
          const appliedFilters: appliedFilter[] = this.state.appliedFilters;
          appliedFilters[column.dataIndex] = newFilter;
          this.setState({ appliedFilters });
          this.filterTable();
        },
      };
      // @ts-ignore
      return MultiSelectRenderer(payload);
    },
    rangepicker: (column: any) => {
      const payload = {
        key: column.key,
        onChange: (e: any) => {
          const newFilter: appliedFilter = {
            filterFunction: (dataItem: any) => {
              const date = moment(dataItem[column.dataIndex])
                .format("YYYY-MM-DD")
                .toString();
              const date0 = e[0].format("YYYY-MM-DD").toString();
              const date1 = e[1].format("YYYY-MM-DD").toString();
              return moment(date).isBetween(date0, date1);
            },
          };
          const appliedFilters: appliedFilter[] = this.state.appliedFilters;
          appliedFilters[column.dataIndex] = newFilter;
          this.setState({ appliedFilters });
          this.filterTable();
        },
      };
      return RangePickerRenderer(payload);
    },
  };

  private filterTable = () => {
    let filteredDataSource = this.state.initialDataSource;
    Object.keys(this.state.appliedFilters).map((key: any) => {
      const filter: appliedFilter = this.state.appliedFilters[key];
      filteredDataSource = filteredDataSource.filter(filter.filterFunction);
    });
    this.setState({ filteredDataSource });
  };

  private resetFilters = () => {
    this.setState({
      appliedFilters: [],
      filteredDataSource: this.state.initialDataSource,
      columns: [],
    });
    if (this.props.columns) {
      this.setState({ columns: this.props.columns });
    }
  };

  constructor(props: any) {
    super(props);

    this.state = {
      initialDataSource: props.dataSource,
      filteredDataSource: props.dataSource,
      columns: props.columns,
      appliedFilters: [],
    };

    this.filterTable = this.filterTable.bind(this);
    this.resetFilters = this.resetFilters.bind(this);
  }

  public componentWillReceiveProps(nextProps: any) {
    if (!_.isEqual(this.props, nextProps)) {
      this.state.initialDataSource = nextProps.dataSource;
      this.resetFilters();
    }
  }

  public render() {
    let columns: any[] = [];
    if (this.props.columns) {
      columns = this.props.columns.map((column) => {
        return {
          sorter: (a, b) => {
            return a[column["dataIndex"]] < b[column["dataIndex"]];
          },
          ...column,
        };
      });
    }

    const haveFilters = Boolean(
      _.filter(this.props.columns, function (o) {
        return o.hasOwnProperty("filtertype");
      }).length
    );
    console.log(
      _.filter(this.props.columns, function (o) {
        return o.hasOwnProperty("filtertype");
      }).length
    );

    console.log(haveFilters);

    return (
      <React.Fragment>
        {this.state.filteredDataSource.length < 1 ? (
          <Empty />
        ) : (
          <React.Fragment>
            <Row
              gutter={24}
              style={{
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              {this.state.columns &&
                this.state.columns
                  .filter((column: any) => column.hasOwnProperty("filterable"))
                  .filter(
                    (column: any) =>
                      typeof this.PropsParserToFilter[column.filterType] ===
                      "function"
                  )
                  .map((column: any, index: number) => {
                    return (
                      <Col
                        key={index}
                        xxl={4}
                        xl={6}
                        md={8}
                        sm={12}
                        xs={24}
                        style={{ margin: "12px 0" }}
                      >
                        <Text>{column.title}:</Text>
                        {this.PropsParserToFilter[column.filterType](column)}
                      </Col>
                    );
                  })}
              {Object.keys(this.state.appliedFilters).length > 0 ? (
                <Col
                  xxl={4}
                  xl={6}
                  md={8}
                  sm={12}
                  xs={24}
                  style={{
                    margin: "12px 0",
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "flex-end",
                  }}
                >
                  <Button type="primary" onClick={this.resetFilters}>
                    Reset
                  </Button>
                </Col>
              ) : null}
            </Row>
            {haveFilters && <Divider />}
            <Row gutter={24} style={{ marginTop: haveFilters ? 12 : 0 }}>
              <Col span={24}>
                <Table
                  {...this.props}
                  // @ts-ignore
                  pagination={
                    this.props.pagination
                      ? this.props.pagination
                      : {
                          pageSizeOptions: [
                            "10",
                            "20",
                            "50",
                            this.state.filteredDataSource.length,
                          ],
                          showSizeChanger: true,
                        }
                  }
                  columns={columns}
                  dataSource={this.state.filteredDataSource}
                  className="tb-ofw"
                />
              </Col>
            </Row>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

export default FilterableTable;
