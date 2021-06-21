let config = {
  sensor: {
    def: {
      name: 'sensor',
      label: '传感器表',
      table: 'dat_sensor',
      keyIndex: 0,
      fields: {
        names: ['sensor_id', 'sensor_type_id', 'data_source', 'work_face_id', 'driver_alarm_threshold', 'alarm_threshold', 'readers', 'drivers', 'x', 'y', 'z', 'sensor_desc'],
        types: ['NUMBER', 'SELECT', 'NUMBER', 'SELECT', 'NUMBER', 'NUMBER', 'STRING', 'STRING', 'NUMBER', 'NUMBER', 'NUMBER', 'STRING'],
        labels: ['编号', '传感器类型', '数据源', '绑定工作面', '通知司机告警阈值', '撤离告警阈值', '绑定分站', '绑定司机', '坐标x', '坐标y', '坐标z', '备注'],
        enableNull: [false, false, false, false, false, false, true, true, true, true, true, true]
      }
    }
  },
  font_size: {
    def: {
      name: 'font_size',
      label: '字体大小',
      table: 'font_size',
      keyIndex: 0,
      fields: {
        names: ['id', 'fontSize'],
        types: ['NUMBER', 'NUMBER'],
        labels: ['编号', '字体倍数'],
        enableNull: [false, false]
      }
    }
  },
  number_bars: {
    def: {
      name: 'number_bars',
      label: '数据条数',
      table: 'number_bars',
      keyIndex: 0,
      fields: {
        names: ['id', 'dataNumber'],
        types: ['NUMBER', 'NUMBER'],
        labels: ['编号', '数据条数'],
        enableNull: [false, false]
      }
    }
  },
  area_isCheck: {
    def: {
      name: 'area',
      label: '区域',
      table: 'dat_area',
      keyIndex: 0, 
      fields: {
        names: ['area_id', 'name', 'area_type_id', 'business_type', 'map_id', 'over_count_person_rp', 'over_count_vehicle', 'over_time_person', 'over_speed_vehicle', 'path', 'angle', 'is_work_area', 'area_att_rule'], // 字段
        types: ['NUMBER', 'STRING', 'SELECT', 'NUMBER', 'SELECT', 'NUMBER', 'NUMBER', 'NUMBER', 'STRING', 'STRING', 'NUMBER', 'SELECT', 'STRING'], // 字段类型
        labels: ['区域编号', '区域名称', '区域类型', '区域业务', '所属地图', '人数上限', '车辆上限', '人停留时长上限(分钟)', '车速上限(Km/h)', '区域定义', '车辆角度', '是否是工作区域', '区域考勤规则'],
        enableNull: [false, false, false, false, false, false, false, false, false, false, true, true, false]
      }
    }
  },
  area: {
    def: {
      name: 'area',
      label: '区域',
      table: 'dat_area',
      keyIndex: 0, 
      fields: {
        // names: ['area_id', 'name', 'area_type_id', 'business_type', 'map_id', 'over_count_person', 'over_count_vehicle', 'over_time_person', 'over_speed_vehicle', 'path', 'angle', 'is_work_area', 'over_count_person_rp', 'need_display', 'area_att_rule'], // 字段
        // types: ['NUMBER', 'STRING', 'SELECT', 'NUMBER', 'SELECT', 'NUMBER', 'NUMBER', 'NUMBER', 'STRING', 'STRING', 'NUMBER', 'SELECT', 'NUMBER', 'SELECT', 'STRING'], // 字段类型
        // labels: ['区域编号', '区域名称', '区域类型', '区域业务', '所属地图', '人数上限', '车辆上限', '人停留时长上限(分钟)', '车速上限(Km/h)', '区域定义', '车辆角度', '是否是工作区域', '区域核对人数上限', '是否对外展示', '区域考勤规则'],
        // enableNull: [false, false, false, false, false, false, false, false, false, false, true, true, true, false, false]
      names: ['area_id', 'name', 'area_type_id', 'business_type', 'map_id', 'over_count_person', 'over_count_vehicle', 'over_time_person', 'over_speed_vehicle', 'path', 'angle', 'is_work_area', 'over_count_person_rp', 'need_display', 'area_att_rule', 'related_area_id', 'related_reader_id', 'related_x', 'related_y', 'related_z'], // 字段
      types: ['NUMBER', 'STRING', 'SELECT', 'NUMBER', 'SELECT', 'NUMBER', 'NUMBER', 'NUMBER', 'STRING', 'STRING', 'NUMBER', 'SELECT', 'NUMBER', 'SELECT', 'STRING', 'SELECT', 'SELECT', 'NUMBER', 'NUMBER', 'NUMBER'], // 字段类型
      labels: ['区域编号', '区域名称', '区域类型', '区域业务', '所属地图', '人数上限', '车辆上限', '人停留时长上限(分钟)', '车速上限(Km/h)', '区域定义', '车辆角度', '是否是工作区域', '区域核对人数上限', '是否对外展示', '区域考勤规则', '关联区域', '关联分站', '关联坐标x', '关联坐标y', '关联坐标z'],
      enableNull: [false, false, false, false, false, false, false, false, false, false, true, true, true, false, false]
      }
    }
  },
  vehicle_type: {
    name: 'vehicle_type',
    label: '车辆类型',
    table: 'dat_vehicle_type',
    keyIndex: 0, // table中key值在 field 中的位置
    fields: {
      names: ['vehicle_type_id', 'name', 'rank', 'capacity', 'vehicle_category_id', 'vehicle_level_id', 'vehicle_att_rule'], // 字段
      types: ['NUMBER', 'STRING', 'NUMBER', 'NUMBER', 'SELECT', 'SELECT', 'STRING'], // 字段类型
      labels: ['车辆类型编号', '车辆类型名称', '车辆类型排序', '车辆载荷能力(吨)', '车辆类型', '车辆等级', '车辆考勤规则'],
      enableNull: [false, false, false, false, false, false, false]
    }
  },
  credentials_staff: {
    def: {
      name: 'credentials_staff',
      label: '资格证信息管理',
      table: 'dat_credentials_staff',
      keyIndex: 0,
      fields: {
        names: ['credentials_staff_id', 'staff_id', 'name', 'dept_id', 'credentials_id', 'credentials_number', 'get_credentials_time', 'expire_time', 'warn_id'], // 字段
        types: ['NUMBER', 'NUMBER', 'STRING', 'NUMBER', 'SELECT', 'STRING', 'DATE', 'DATE', 'SELECT'], // 字段类型
        labels: ['编号', '员工编号', '姓名', '部门', '证件类型', '证件编号', '取证时间', '到期时间', '是否提醒'],
        enableNull: [false, false, true, false, false, false, true, true, true]
      }
    }
  }
}

export {config}