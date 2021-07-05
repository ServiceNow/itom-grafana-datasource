import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms, AsyncSelect } from '@grafana/ui';
import { InlineFormLabel } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './DataSource';
import { defaultQuery, PluginDataSourceOptions, PluginQuery } from './types';
import * as utils from './Utils';
import { SplitQueryEditor } from './SplitQueryEditor';

const { FormField } = LegacyForms;
const { Select } = LegacyForms;
import { SelectableValue } from '@grafana/data';

type Props = QueryEditorProps<DataSource, PluginQuery, PluginDataSourceOptions>;

let metricsTable: any;
let sourceSelection: any[] = [];

let serviceOptions: any[] = [];

let sourceOptions: any[] = [];
let metricNameOptions: any[] = [];

let metricTypeOptions: any[] = [];

let metricAnomalyOptions = [
  {
    label: 'true',
    value: 'true',
    description: '',
  },
  {
    label: 'false',
    value: 'false',
    description: '',
  },
];

export const QueryEditor: React.FC<Props> = (props) => {
  return (
    <SplitQueryEditor
      {...props}
    />
  )
}

export class QueryEditor2 extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  getMetricTable = async () => {
    let table: any;
    if (typeof metricsTable === 'undefined') {
      table = await this.props.datasource.snowConnection.getMetricsDefinition('', 0, 0, '');
      return table;
    }
    return metricsTable;
  };

  loadCategoryOptions = async () => {
    const { query } = this.props;
    let categoryOptions = await this.props.datasource.snowConnection.getCategoryQueryOption();

    //Grab Services based on either the currently selected Category, or the first Category in the list
    let newServices = await this.props.datasource.snowConnection.getServices(
      query.selectedQueryCategory['value'] || categoryOptions[0]['value']
    );
    newServices.map(ns => {
      //Check if service is already in the options
      let previousService: boolean = false;
      for (let i = 0; i < serviceOptions.length; i++) {
        if (serviceOptions[i].value === ns.value) {
          previousService = true;
        }
      }
      if (!previousService) {
        serviceOptions.push({ label: ns['text'], value: ns['value'] });
      }
    });

    metricsTable = await this.getMetricTable();
    let newSources: any[] = [];
    //Grab Sources based on either the currently selected Service, or grabs all ci's with metrics
    if (typeof query.selectedServiceList !== 'undefined' && query.selectedServiceList !== null) {
      newSources = await this.props.datasource.snowConnection.getCIs('', query.selectedServiceList['value'] || '');
    } else {
      for (let i = 0; i < metricsTable.fields[3].values.buffer.length; i++) {
        if (metricsTable.fields[2].values.buffer[i] !== '' || metricsTable.fields[4].values.buffer[i] !== '') {
          newSources.push({
            text: metricsTable.fields[3].values.buffer[i],
            value: metricsTable.fields[3].values.buffer[i],
          });
        }
      }
    }
    newSources.map(ns => {
      //Check if Source is already in the options
      let previousSource: boolean = false;
      for (let i = 0; i < sourceOptions.length; i++) {
        if (sourceOptions[i].value === ns.value) {
          previousSource = true;
        }
      }
      if (!previousSource) {
        sourceOptions.push({ label: ns['text'], value: ns['value'] });
      }
    });

    metricTypeOptions.push({ label: '*', value: '*' });
    metricNameOptions.push({ label: '*', value: '*' });

    let typeSelection: any[] = [];

    if (typeof query.selectedSourceList !== 'undefined' && query.selectedSourceList !== null) {
      query.selectedSourceList.map(chosenSource => {
        sourceSelection.push(chosenSource.value);
      });
      for (let i = 0; i < metricsTable.fields[0].values.buffer.length; i++) {
        if (sourceSelection.includes(metricsTable.fields[3].values.buffer[i])) {
          if (metricsTable.fields[4].values.buffer[i] !== '') {
            let previousType: boolean = false;
            for (let j = 0; j < metricTypeOptions.length; j++) {
              if (metricTypeOptions[j].value === metricsTable.fields[4].values.buffer[i]) {
                previousType = true;
              }
            }
            if (!previousType) {
              metricTypeOptions.push({
                label: metricsTable.fields[4].values.buffer[i],
                value: metricsTable.fields[4].values.buffer[i],
              });
            }
          }
          if (typeof query.selectedMetricTypeList !== 'undefined' && query.selectedMetricTypeList !== null) {
            typeSelection = [];
            query.selectedMetricTypeList.map(chosenType => {
              typeSelection.push(chosenType.value);
            });
            if (typeSelection.includes(metricsTable.fields[4].values.buffer[i])) {
              let previousName: boolean = false;
              for (let j = 0; j < metricNameOptions.length; j++) {
                if (metricNameOptions[j].value === metricsTable.fields[2].values.buffer[i]) {
                  previousName = true;
                }
              }
              if (!previousName) {
                metricNameOptions.push({
                  label: metricsTable.fields[2].values.buffer[i],
                  value: metricsTable.fields[2].values.buffer[i],
                });
              }
            }
          } else {
            let previousName: boolean = false;
            for (let j = 0; j < metricNameOptions.length; j++) {
              if (metricNameOptions[j].value === metricsTable.fields[2].values.buffer[i]) {
                previousName = true;
              }
            }
            if (!previousName) {
              metricNameOptions.push({
                label: metricsTable.fields[2].values.buffer[i],
                value: metricsTable.fields[2].values.buffer[i],
              });
            }
          }
        }
      }
    } else {
      for (let i = 0; i < metricsTable.fields[0].values.buffer.length; i++) {
        if (metricsTable.fields[4].values.buffer[i] !== '') {
          let previousType: boolean = false;
          for (let j = 0; j < metricTypeOptions.length; j++) {
            if (metricTypeOptions[j].value === metricsTable.fields[4].values.buffer[i]) {
              previousType = true;
            }
          }
          if (!previousType) {
            metricTypeOptions.push({
              label: metricsTable.fields[4].values.buffer[i],
              value: metricsTable.fields[4].values.buffer[i],
            });
          }
        }
        if (typeof query.selectedMetricTypeList !== 'undefined' && query.selectedMetricTypeList !== null) {
          query.selectedMetricTypeList.map(chosenType => {
            typeSelection.push(chosenType.value);
          });
          if (typeSelection.includes(metricsTable.fields[4].values.buffer[i])) {
            let previousName: boolean = false;
            for (let j = 0; j < metricNameOptions.length; j++) {
              if (metricNameOptions[j].value === metricsTable.fields[2].values.buffer[i]) {
                previousName = true;
              }
            }
            if (!previousName) {
              metricNameOptions.push({
                label: metricsTable.fields[2].values.buffer[i],
                value: metricsTable.fields[2].values.buffer[i],
              });
            }
          }
        } else {
          let previousName: boolean = false;
          for (let j = 0; j < metricNameOptions.length; j++) {
            if (metricNameOptions[j].value === metricsTable.fields[2].values.buffer[i]) {
              previousName = true;
            }
          }
          if (!previousName) {
            metricNameOptions.push({
              label: metricsTable.fields[2].values.buffer[i],
              value: metricsTable.fields[2].values.buffer[i],
            });
          }
        }
      }
    }

    return categoryOptions;
  };

  onQueryCategoryChange = async (event: SelectableValue<string>) => {
    const { onChange, query } = this.props;
    serviceOptions = [];
    if (event.value !== undefined) {
      let selectedCategory: string = event['value'].toString();
      let newServices = await this.props.datasource.snowConnection.getServices(selectedCategory);

      newServices.map(ns => {
        let previousService: boolean = false;
        for (let i = 0; i < serviceOptions.length; i++) {
          if (serviceOptions[i].value === ns.value) {
            previousService = true;
          }
        }
        if (!previousService) {
          serviceOptions.push({ label: ns['text'], value: ns['value'] });
        }
      });
    }
    onChange({ ...query, selectedQueryCategory: event });
  };

  onServiceListChange = async (event: SelectableValue<string>) => {
    const { onChange, query } = this.props;
    let newSources: any[] = [];
    sourceOptions = [];
    if (event) {
      let selectedValues: string = event.value || '';
      newSources = await this.props.datasource.snowConnection.getCIs('', selectedValues);
    } else {
      for (let i = 0; i < metricsTable.fields[3].values.buffer.length; i++) {
        if (metricsTable.fields[2].values.buffer[i] !== '' || metricsTable.fields[4].values.buffer[i] !== '') {
          newSources.push({
            text: metricsTable.fields[3].values.buffer[i],
            value: metricsTable.fields[3].values.buffer[i],
          });
        }
      }
    }
    newSources.map(ns => {
      let previousSource: boolean = false;
      for (let i = 0; i < sourceOptions.length; i++) {
        if (sourceOptions[i].value === ns.value) {
          previousSource = true;
        }
      }
      if (!previousSource) {
        sourceOptions.push({ label: ns['text'], value: ns['value'] });
      }
    });
    onChange({ ...query, selectedServiceList: event });
  };
  onSourceListChange = async (event: SelectableValue<string>) => {
    const { onChange, query } = this.props;
    metricsTable = await this.getMetricTable();
    metricNameOptions = [{ label: '*', value: '*' }];
    metricTypeOptions = [{ label: '*', value: '*' }];
    if (event) {
      let selectedValues = event.map(e => e['value']);
      console.log('Source Value');
      console.log(selectedValues);
      sourceSelection = selectedValues;
      for (let i = 0; i < metricsTable.fields[0].values.buffer.length; i++) {
        if (sourceSelection.includes(metricsTable.fields[3].values.buffer[i])) {
          let previousName: boolean = false;
          for (let j = 0; j < metricNameOptions.length; j++) {
            if (metricNameOptions[j].value === metricsTable.fields[2].values.buffer[i]) {
              previousName = true;
            }
          }
          if (!previousName) {
            metricNameOptions.push({
              label: metricsTable.fields[2].values.buffer[i],
              value: metricsTable.fields[2].values.buffer[i],
            });
          }
          if (metricsTable.fields[4].values.buffer[i] !== '') {
            let previousType: boolean = false;
            for (let j = 0; j < metricTypeOptions.length; j++) {
              if (metricTypeOptions[j].value === metricsTable.fields[4].values.buffer[i]) {
                previousType = true;
              }
            }
            if (!previousType) {
              metricTypeOptions.push({
                label: metricsTable.fields[4].values.buffer[i],
                value: metricsTable.fields[4].values.buffer[i],
              });
            }
          }
        }
      }
    } else {
      for (let i = 0; i < metricsTable.fields[0].values.buffer.length; i++) {
        let previousName: boolean = false;
        for (let j = 0; j < metricNameOptions.length; j++) {
          if (metricNameOptions[j].value === metricsTable.fields[2].values.buffer[i]) {
            previousName = true;
          }
        }
        if (!previousName) {
          metricNameOptions.push({
            label: metricsTable.fields[2].values.buffer[i],
            value: metricsTable.fields[2].values.buffer[i],
          });
        }
        if (metricsTable.fields[4].values.buffer[i] !== '') {
          let previousType: boolean = false;
          for (let j = 0; j < metricTypeOptions.length; j++) {
            if (metricTypeOptions[j].value === metricsTable.fields[4].values.buffer[i]) {
              previousType = true;
            }
          }
          if (!previousType) {
            metricTypeOptions.push({
              label: metricsTable.fields[4].values.buffer[i],
              value: metricsTable.fields[4].values.buffer[i],
            });
          }
        }
      }
      sourceSelection = [];
    }
    query.source = utils.createRegEx(sourceSelection);
    onChange({ ...query, selectedSourceList: event });
  };
  onMetricTypeListChange = (event: SelectableValue<string>) => {
    const { onChange, query } = this.props;
    let selectedValues: any[] = [];
    metricNameOptions = [{ label: '*', value: '*' }];
    if (event) {
      selectedValues = event.map(e => e['value']);
      console.log('Metric Type Selected');

      let starIndex: number = selectedValues.indexOf('*');
      if (starIndex >= 0) selectedValues.splice(starIndex);
    }
    if (selectedValues.length > 0) {
      for (let i = 0; i < metricsTable.fields[0].values.buffer.length; i++) {
        if (selectedValues.includes(metricsTable.fields[4].values.buffer[i])) {
          let previousName: boolean = false;
          for (let j = 0; j < metricNameOptions.length; j++) {
            if (metricNameOptions[j].value === metricsTable.fields[2].values.buffer[i]) {
              previousName = true;
            }
          }
          if (!previousName) {
            metricNameOptions.push({
              label: metricsTable.fields[2].values.buffer[i],
              value: metricsTable.fields[2].values.buffer[i],
            });
          }
        }
      }
    } else {
      for (let i = 0; i < metricsTable.fields[0].values.buffer.length; i++) {
        if (sourceSelection) {
          if (sourceSelection.includes(metricsTable.fields[3].values.buffer[i])) {
            let previousName: boolean = false;
            for (let j = 0; j < metricNameOptions.length; j++) {
              if (metricNameOptions[j].value === metricsTable.fields[2].values.buffer[i]) {
                previousName = true;
              }
            }
            if (!previousName) {
              metricNameOptions.push({
                label: metricsTable.fields[2].values.buffer[i],
                value: metricsTable.fields[2].values.buffer[i],
              });
            }
          }
        } else {
          let previousName: boolean = false;
          for (let j = 0; j < metricNameOptions.length; j++) {
            if (metricNameOptions[j].value === metricsTable.fields[2].values.buffer[i]) {
              previousName = true;
            }
          }
          if (!previousName) {
            metricNameOptions.push({
              label: metricsTable.fields[2].values.buffer[i],
              value: metricsTable.fields[2].values.buffer[i],
            });
          }
        }
      }
    }
    if (event) {
      query.metricType = event.map(e => e['value']) || '';
    } else {
      query.metricType = '';
    }
    query.metricType = utils.createRegEx(query.metricType);
    onChange({ ...query, selectedMetricTypeList: event });
  };

  onMetricNameListChange = (event: SelectableValue<string>) => {
    const { onChange, query } = this.props;
    if (event) {
      query.metricName = event.map(e => e['value']) || '';
    } else {
      query.metricName = '';
    }
    query.metricName = utils.createRegEx(query.metricName);
    onChange({ ...query, selectedMetricNameList: event });
  };
  loadAgentFilters = async () => {
    var options = await this.props.datasource.snowConnection.getAgentFilters();
    return options;
  }
  onAgentFilterChange = (event: SelectableValue<string>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, selectedAgentFilter: event });
  }
  onSelectedAdminCategoryList = (event: SelectableValue<string>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, selectedAdminCategoryList: event });
  };
  onAlertStateListChange = (event: SelectableValue<string>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, selectedAlertStateList: event });
  };
  onAlertTypeListChange = (event: SelectableValue<string>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, selectedAlertTypeList: event });
  };
  onChangeTypeListChange = (event: SelectableValue<string>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, selectedChangeTypeList: event });
  }
  onServiceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, service: event.target.value });
  };
  onSourceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, source: event.target.value });
  };
  onMetricTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, metricType: event.target.value });
  };
  onMetricNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, metricName: event.target.value });
  };
  onSysParamQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, sysparam_query: event.target.value });
  };
  onAgentFilterTypeChange = (event: SelectableValue<string>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, selectedAgentFilterType: event});
  };
  onTopologyDepthChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    if (event.target.value === '' || isNaN(Number(event.target.value))) event.target.value = "0";
    onChange({ ...query, topology_depth: Number(event.target.value)});
  };

  onMetricAnomalyListChange = (event: SelectableValue<string>) => {
    const { onChange, query } = this.props;
    if (event) {
      query.metricAnomaly = event?.value?.toString() || 'false';
    } else {
      query.metricAnomaly = 'false';
    }

    onChange({ ...query, selectedMetricAnomalyList: event });
  };

  options = [
    { label: 'Basic option', value: 0 },
    {
      label: 'Option with description',
      value: 1,
      description: 'this is a description',
    },
    {
      label: 'Option with description and image',
      value: 2,
      description: 'This is a very elaborate description, describing all the wonders in the world.',
      imgUrl: 'https://placekitten.com/40/40',
    },
  ];

  render() {
    const query = defaults(this.props.query, defaultQuery);

    const { selectedQueryCategory } = query;
    const { sysparam_query } = query;

    const { selectedServiceList } = query;
    const { selectedSourceList } = query;
    const { selectedMetricNameList } = query;
    const { selectedMetricTypeList } = query;
    const { selectedAdminCategoryList } = query;
    const { selectedAlertStateList } = query;
    const { selectedAlertTypeList } = query;
    const { selectedChangeTypeList } = query;
    const { selectedMetricAnomalyList } = query;
    const { selectedAgentFilter } = query;
    const { selectedAgentFilterType } = query;
    const { topology_depth } = query;

    //let queryCategoryOption = this.props.datasource.snowConnection.getCategoryQueryOption();

    let alertStateOptions = this.props.datasource.snowConnection.getAlertStateOptions();
    let alertTypeOptions = this.props.datasource.snowConnection.getAlertTypeOptions();
    let changeTypeOptions = this.props.datasource.snowConnection.getChangeTypeOptions();
    let adminCategoryOption = this.props.datasource.snowConnection.getAdminQueryOptions();
    let agentFilterTypeOptions = this.props.datasource.snowConnection.getAgentFilterTypeOptions();

    return (
      <>
        <div className="gf-form-inline">
          <div className="gf-form">
            <InlineFormLabel
              className="width-10"
              tooltip="Category for the query such as Metrics, Incidents, Alerts, Geografical alerts"
            >
              Query Category
            </InlineFormLabel>

            <AsyncSelect
              loadOptions={this.loadCategoryOptions}
              defaultOptions
              value={selectedQueryCategory || ''}
              allowCustomValue
              onChange={this.onQueryCategoryChange}
              className={'min-width-10'}
            />
          </div>
        </div>

        <div>
          {(selectedQueryCategory.value !== 'Admin' && selectedQueryCategory.value !== 'Agents') && (
            <div>
              <div className="gf-form-inline">
                <div className="gf-form">
                  <InlineFormLabel className="width-10" tooltip="">
                    Services
                  </InlineFormLabel>
                  <Select
                    options={serviceOptions}
                    value={selectedServiceList || ''}
                    allowCustomValue
                    onChange={this.onServiceListChange}
                    isSearchable={true}
                    isClearable={true}
                    isMulti={false}
                    backspaceRemovesValue={true}
                    className={'min-width-10'}
                  />
                </div>
              </div>
              {selectedQueryCategory.value !== 'Topology' && (
                <div className="gf-form-inline">
                  <div className="gf-form">
                    <InlineFormLabel className="width-10" tooltip="">
                      CI Name
                    </InlineFormLabel>
                    <Select
                      options={sourceOptions}
                      value={selectedSourceList || ''}
                      allowCustomValue
                      onChange={this.onSourceListChange}
                      isSearchable={true}
                      isClearable={true}
                      isMulti={true}
                      backspaceRemovesValue={true}
                      className={'min-width-10'}
                    />
                  </div>
                </div>
              )}
              {selectedQueryCategory.value === 'CI_Summary' && (
                <div className="gf-form max-width-21">
                  <FormField
                    labelWidth={10}
                    inputWidth={10}
                    value={sysparam_query}
                    onChange={this.onSysParamQueryChange}
                    label="sysparam_query"
                    tooltip="use sysparam query to filter return results example: source=EMSelfMonitoring"
                  />
                </div>
              )}
            </div>
          )}
          {selectedQueryCategory.value === 'Metrics' && (
            <div>
              <div className="gf-form-inline">
                <div className="gf-form">
                  <InlineFormLabel className="width-10" tooltip="">
                    Resource ID
                  </InlineFormLabel>
                  <Select
                    options={metricTypeOptions}
                    value={selectedMetricTypeList || ''}
                    allowCustomValue
                    onChange={this.onMetricTypeListChange}
                    isSearchable={true}
                    isClearable={true}
                    isMulti={true}
                    backspaceRemovesValue={true}
                    className={'min-width-10'}
                  />
                </div>
              </div>
            </div>
          )}
          {(selectedQueryCategory.value === 'Metrics' || selectedQueryCategory.value === 'Agents') && (
            <div>
              <div className="gf-form-inline">
                <div className="gf-form">
                  <InlineFormLabel className="width-10" tooltip="">
                    Metric Name
                  </InlineFormLabel>
                  <Select
                    options={metricNameOptions}
                    value={selectedMetricNameList || ''}
                    allowCustomValue
                    onChange={this.onMetricNameListChange}
                    isSearchable={true}
                    isClearable={true}
                    isMulti={true}
                    backspaceRemovesValue={true}
                    className={'min-width-10'}
                  />
                </div>
              </div>
            </div>
          )}
          {selectedQueryCategory.value === 'Metrics' && (
            <div>
              <div className="gf-form-inline">
                <div className="gf-form">
                  <InlineFormLabel className="width-10" tooltip="">
                    Anomaly
                  </InlineFormLabel>
                  <Select
                    options={metricAnomalyOptions}
                    value={selectedMetricAnomalyList || ''}
                    onChange={this.onMetricAnomalyListChange}
                    allowCustomValue
                    isClearable={true}
                    className={'min-width-10'}
                  />
                </div>
              </div>
              <div className="gf-form max-width-21">
                <FormField
                  labelWidth={10}
                  inputWidth={10}
                  value={sysparam_query}
                  onChange={this.onSysParamQueryChange}
                  label="sysparam_query"
                  tooltip="use sysparam query to filter return results example: source=EMSelfMonitoring"
                />
              </div>
            </div>
          )}
          {selectedQueryCategory.value === 'Alerts' && (
            <div>
              <div className="gf-form max-width-21">
                <InlineFormLabel className="width-10" tooltip="">
                  Alert Filter
                </InlineFormLabel>

                <Select
                  options={alertTypeOptions}
                  value={selectedAlertTypeList || ''}
                  onChange={this.onAlertTypeListChange}
                />
                <Select
                  options={alertStateOptions}
                  value={selectedAlertStateList || ''}
                  onChange={this.onAlertStateListChange}
                />
              </div>
              <div className="gf-form max-width-21">
                <FormField
                  labelWidth={10}
                  inputWidth={10}
                  value={sysparam_query}
                  onChange={this.onSysParamQueryChange}
                  label="sysparam_query"
                  tooltip="use sysparam query to filter return results example: source=EMSelfMonitoring"
                />
              </div>
            </div>
          )}
          {selectedQueryCategory.value === 'Changes' && (
            <div>
              <div className="gf-form max-width-21">
                <InlineFormLabel className="width-10" tooltip="">
                  Changes Based On
                </InlineFormLabel>

                <Select
                  options={changeTypeOptions}
                  value={selectedChangeTypeList || ''}
                  onChange={this.onChangeTypeListChange}
                />
              </div>
              <div className="gf-form max-width-21">
                <FormField
                  labelWidth={10}
                  inputWidth={10}
                  value={sysparam_query}
                  onChange={this.onSysParamQueryChange}
                  label="sysparam_query"
                  tooltip="use sysparam query to filter return results example: state!=Closed"
                />
              </div>
            </div>
          )}
          {selectedQueryCategory.value === 'Agents' && (
            <div>
              <div className="gf-form-inline">
                <div className="gf-form">
                  <InlineFormLabel className="width-10" tooltip="">
                    Agents Filter
                  </InlineFormLabel>
                  <Select
                    options={agentFilterTypeOptions}
                    value={selectedAgentFilterType || ''}
                    allowCustomValue
                    onChange={this.onAgentFilterTypeChange}
                  />
                  <AsyncSelect
                    loadOptions={this.loadAgentFilters}
                    defaultOptions
                    value={selectedAgentFilter || ''}
                    allowCustomValue={true}
                    onChange={this.onAgentFilterChange}
                    className={'min-width-10'}
                  />
                </div>
              </div>
              <div className="gf-form max-width-21">
                <FormField
                  labelWidth={10}
                  inputWidth={10}
                  value={sysparam_query}
                  onChange={this.onSysParamQueryChange}
                  label="sysparam_query"
                  tooltip="use sysparam query to filter return results example: state!=Closed"
                />
              </div>
            </div>
          )}
          {selectedQueryCategory.value === 'Topology' && (
            <div className="gf-form max-width-21">
              <FormField
                labelWidth={10}
                inputWidth={10}
                value={topology_depth}
                onChange={this.onTopologyDepthChange}
                label="Depth"
                tooltip="Determines the amount of layers in the tree to search. Default is 3"
                color="blue"
              />
            </div>
          )}
          {selectedQueryCategory.value === 'Admin' && (
            <div>
              <div className="gf-form max-width-21">
                <InlineFormLabel className="width-10" tooltip="">
                  Category Option
                </InlineFormLabel>
                <Select
                  options={adminCategoryOption}
                  value={selectedAdminCategoryList || ''}
                  allowCustomValue
                  onChange={this.onSelectedAdminCategoryList}
                />
                <FormField
                  labelWidth={12}
                  value={sysparam_query}
                  onChange={this.onSysParamQueryChange}
                  label="sysparam_query"
                  tooltip="use sysparam query to filter return results example: source=Observability"
                  color="blue"
                />
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
}
