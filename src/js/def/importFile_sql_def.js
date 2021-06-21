let importSqlDef = {
  area: {
    isCheck: 'select da.area_id,da.name,da.area_type_id,da.business_type,da.map_id,da.over_count_person,da.over_count_vehicle,da.over_time_person,da.over_speed_vehicle,da.path,angle,da.is_work_area,dar.name as rulename from dat_area da left join dat_att_rule_area dara on dara.area_id = da.area_id left join dat_att_rule dar on dar.att_rule_id = dara.att_rule_id order by da.area_id',
    noCheck: 'select da.area_id,da.name,da.area_type_id,da.business_type,da.map_id,da.over_count_person,da.over_count_vehicle,da.over_time_person,da.over_speed_vehicle,da.path,angle,da.is_work_area,da.over_count_person_rp,da.need_display,dar.name as rulename from dat_area da left join dat_att_rule_area dara on dara.area_id = da.area_id left join dat_att_rule dar on dar.att_rule_id = dara.att_rule_id order by da.area_id'
  },
  vehicle_type: {
    isCheck: 'select dvt.vehicle_type_id,dvt.name,dvt.rank,dvt.capacity,dvt.vehicle_category_id,dvt.vehicle_level_id,dar.name as rulename from dat_vehicle_type dvt left join dat_att_rule_vehicle_type darvt on darvt.vehicle_type_id = dvt.vehicle_type_id left join dat_att_rule dar on dar.att_rule_id = darvt.att_rule_id order by vehicle_type_id;',
    noCheck: 'select dvt.vehicle_type_id,dvt.name,dvt.rank,dvt.capacity,dvt.vehicle_category_id,dvt.vehicle_level_id,dar.name as rulename from dat_vehicle_type dvt left join dat_att_rule_vehicle_type darvt on darvt.vehicle_type_id = dvt.vehicle_type_id left join dat_att_rule dar on dar.att_rule_id = darvt.att_rule_id order by vehicle_type_id;'
  },
  rt_person_forbid_down_mine: {
    isCheck: 'select fdm.staff_id, name, dept_id,start_time,oper_time,oper_user from rt_person_forbid_down_mine fdm LEFT JOIN dat_staff ds ON fdm.staff_id = ds.staff_id LEFT JOIN dat_staff_extend dse ON ds.staff_id = dse.staff_id where status = 1;',
    noCheck: 'select fdm.staff_id, name, dept_id,start_time,oper_time,oper_user from rt_person_forbid_down_mine fdm LEFT JOIN dat_staff ds ON fdm.staff_id = ds.staff_id LEFT JOIN dat_staff_extend dse ON ds.staff_id = dse.staff_id where status = 1;'
  }
  
   
}

export { importSqlDef }