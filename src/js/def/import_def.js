const importDef = {
  'rt_person_forbid_down_mine': {
    label: '禁止下井人员表',
    name: 'rt_person_forbid_down_mine',
    keyIndex: 0,
    table: 'rt_person_forbid_down_mine',
    fields: {
      labels: ['员工编号', '姓名', '部门'],
      names: ['staff_id', 'name', 'dept_id'],
      types: ['NUMBER', 'STRING', 'SELECT'],
      enableNull: [false, false, false]
    }
  },
  'credentials_staff': {
    name: 'credentials_staff',
    label: '资格证信息管理',
    table: 'dat_credentials_staff',
    keyIndex: 0, // table中key值在 field 中的位置
    fields: {
      names: ['staff_id', 'credentials_id', 'credentials_number', 'get_credentials_time', 'expire_time','warn_id'], // 字段
      types: ['NUMBER', 'SELECT', 'STRING', 'DATE', 'DATE','SELECT'], // 字段类型
      labels: ['员工编号', '证件类型', '证件编号', '取证时间', '到期时间','是否提醒'],
      enableNull: [false, false, false, true, true, true, true]
    }
  }
}

export default importDef