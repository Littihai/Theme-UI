import 'package:flutter/material.dart';

/// Platform icons: Material Symbols (bundled with Flutter) behind one name list, so modules, settings and controls
/// share one visual language and swapping the set later (Octicons, a custom font) is one file. Add a name here before
/// using a new one; never an emoji. See docs/decisions/0040-material-icons-on-flutter.md.
enum AppIcon {
  // modules
  inbox(Icons.inbox_outlined),
  calendar(Icons.calendar_today_outlined),
  organization(Icons.account_tree_outlined),
  checklist(Icons.checklist_outlined),
  package(Icons.inventory_2_outlined),
  container(Icons.view_in_ar_outlined),
  paperAirplane(Icons.send_outlined),
  tools(Icons.build_outlined),
  packageDependents(Icons.hub_outlined),
  tag(Icons.label_outlined),
  fileCheck(Icons.task_outlined),
  commentDiscussion(Icons.forum_outlined),
  idBadge(Icons.badge_outlined),
  fileDirectory(Icons.folder_outlined),
  log(Icons.table_rows_outlined),
  graph(Icons.bar_chart_outlined),
  pulse(Icons.monitor_heart_outlined),
  meter(Icons.speed_outlined),
  briefcase(Icons.work_outline),
  people(Icons.group_outlined),
  shieldLock(Icons.admin_panel_settings_outlined),
  gear(Icons.settings_outlined),
  // navigation and controls
  home(Icons.home_outlined),
  apps(Icons.apps),
  search(Icons.search),
  scan(Icons.qr_code_scanner),
  bell(Icons.notifications_none),
  chevronRight(Icons.chevron_right),
  chevronLeft(Icons.chevron_left),
  chevronDown(Icons.expand_more),
  chevronUp(Icons.expand_less),
  moon(Icons.dark_mode_outlined),
  sun(Icons.light_mode_outlined),
  arrowRight(Icons.arrow_forward),
  arrowLeft(Icons.arrow_back),
  arrowUp(Icons.arrow_upward),
  unfold(Icons.unfold_more),
  sidebarCollapse(Icons.keyboard_double_arrow_left),
  sidebarExpand(Icons.keyboard_double_arrow_right),
  threeBars(Icons.menu),
  x(Icons.close),
  star(Icons.star_border),
  starFill(Icons.star),
  check(Icons.check),
  checkCircle(Icons.check_circle_outline),
  pencil(Icons.edit_outlined),
  plus(Icons.add),
  trash(Icons.delete_outline),
  question(Icons.help_outline),
  eye(Icons.visibility_outlined),
  eyeClosed(Icons.visibility_off_outlined),
  signOut(Icons.logout),
  dots(Icons.more_horiz),
  filter(Icons.filter_list),
  refresh(Icons.refresh),
  print(Icons.print_outlined),
  keyboard(Icons.keyboard_outlined),
  translate(Icons.translate),
  openInNew(Icons.open_in_new),
  lock(Icons.lock_outline),
  // settings and misc
  person(Icons.person_outline),
  key(Icons.key_outlined),
  sliders(Icons.tune),
  shield(Icons.shield_outlined),
  workflow(Icons.schema_outlined),
  database(Icons.storage_outlined),
  download(Icons.download_outlined),
  upload(Icons.upload_outlined),
  info(Icons.info_outline),
  globe(Icons.language),
  paintbrush(Icons.brush_outlined),
  mail(Icons.mail_outline),
  beaker(Icons.science_outlined),
  server(Icons.dns_outlined),
  deviceDesktop(Icons.desktop_windows_outlined),
  history(Icons.history),
  hourglass(Icons.hourglass_empty),
  alert(Icons.warning_amber_outlined),
  blocked(Icons.block),
  bug(Icons.bug_report_outlined),
  telescope(Icons.explore_outlined),
  note(Icons.description_outlined),
  paperclip(Icons.attach_file),
  deviceCamera(Icons.photo_camera_outlined),
  image(Icons.image_outlined),
  video(Icons.videocam_outlined),
  zap(Icons.bolt),
  sync(Icons.sync),
  file(Icons.insert_drive_file_outlined),
  archive(Icons.archive_outlined),
  clock(Icons.schedule),
  copy(Icons.content_copy),
  location(Icons.place_outlined),
  code(Icons.code),
  palette(Icons.palette_outlined),
  textSize(Icons.format_size),
  phone(Icons.phone_outlined),
  wifiOff(Icons.wifi_off),
  cloudOff(Icons.cloud_off_outlined);

  const AppIcon(this.data);
  final IconData data;
}

/// One icon of the set at the house sizes (16 inline, 18 in buttons, 20 in menus, 24 on tiles).
class AppIconW extends StatelessWidget {
  const AppIconW(this.icon, {super.key, this.size = 18, this.color});
  final AppIcon icon;
  final double size;
  final Color? color;

  @override
  Widget build(BuildContext context) => Icon(icon.data, size: size, color: color);
}
