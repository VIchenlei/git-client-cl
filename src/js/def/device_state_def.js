const deviceStateDef = {
  'device': {
    name: 'device',
    label: '设备',
    table: '',
    keyIndex: 0,
    fields: {
      names: ['device_id', 'device_type_id', 'state', 'time'],
      types: ['NUMBER', 'NUMBER', 'NUMBER', 'DATE'],
      labels: ['设备编号', '设备类型', '设备状态', '状态更新时间']
    }
  }
}

export default deviceStateDef
