// ignore_for_file: prefer_const_constructors, unused_element, prefer_const_constructors_in_immutables, prefer_const_literals_to_create_immutables, sort_child_properties_last, unused_import, deprecated_member_use, duplicate_ignore, sized_box_for_whitespace, annotate_overrides, use_key_in_widget_constructors, unnecessary_new, file_names

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:eveno/Profile/80_settings_profile.dart';
import 'package:eveno/Profile/81_notification.dart';
import 'package:eveno/Profile/82_payments.dart';
import 'package:eveno/Profile/83_settings_linked_accounts.dart';
import 'package:eveno/Profile/84_settings_security.dart';
import 'package:eveno/Profile/85_settings_language.dart';
import 'package:eveno/Profile/87_settings_invited_friends.dart';
import 'package:eveno/Profile/88_settings_help_center_FAQ.dart';
import 'package:eveno/Widget/textFiealds.dart';
import 'package:eveno/auth/create_new_account.dart';
import 'package:eveno/main.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class ProfileScreen extends StatefulWidget {
  final AnimationController animationController;

  const ProfileScreen({super.key, required this.animationController});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late ScrollController controller;
  bool isLoadingSliderDetail = false;
  var sliderImageHieght = 0.0;
  void initState() {
    _animationController =
        AnimationController(duration: Duration(milliseconds: 0), vsync: this);
    widget.animationController.forward();
    controller = ScrollController(initialScrollOffset: 0.0);

    controller.addListener(() {
      // ignore: unnecessary_null_comparison
      if (context != null) {
        if (controller.offset < 0) {
          _animationController.animateTo(0.0);
        } else if (controller.offset > 0.0 &&
            controller.offset < sliderImageHieght) {
          if (controller.offset < ((sliderImageHieght / 1.5))) {
            _animationController
                .animateTo((controller.offset / sliderImageHieght));
          } else {
            _animationController
                .animateTo((sliderImageHieght / 1.5) / sliderImageHieght);
          }
        }
      }
    });
    loadingSliderDetail();
    super.initState();
  }

  loadingSliderDetail() async {
    setState(() {
      isLoadingSliderDetail = true;
    });
    await Future.delayed(const Duration(milliseconds: 700));
    setState(() {
      isLoadingSliderDetail = false;
    });
  }

  int index = 0;
  bool isdark = false;
  @override
  Widget build(BuildContext context) {
    sliderImageHieght = MediaQuery.of(context).size.width * 1.3;
    return AnimatedBuilder(
      animation: widget.animationController,
      builder: (BuildContext context, Widget? child) {
        return FadeTransition(
          opacity: widget.animationController,
          child: Transform(
            transform: new Matrix4.translationValues(
              0.0,
              40 * (1.0 - widget.animationController.value),
              0.0,
            ),
            child: Scaffold(
              body: Padding(
                padding: EdgeInsets.only(
                    left: 16,
                    right: 16,
                    top: MediaQuery.of(context).padding.top + 16,
                    bottom: MediaQuery.of(context).padding.bottom + 16),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Image.asset(
                          ConstanceData.f9,
                          height: 30,
                        ),
                        SizedBox(
                          width: 10,
                        ),
                        Text(
                          "Profile",
                          style: Theme.of(context)
                              .textTheme
                              .bodyLarge!
                              .copyWith(
                                  fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        Spacer(),
                        Image.asset(
                          AppTheme.isLightTheme
                              ? ConstanceData.n1
                              : ConstanceData.dn1,
                          height: 25,
                        ),
                      ],
                    ),
                    SizedBox(
                      height: 30,
                    ),
                    Expanded(
                      child: ListView(
                        padding: EdgeInsets.zero,
                        children: [
                          Image.asset(
                            ConstanceData.t11,
                            height: 100,
                          ),
                          SizedBox(
                            height: 10,
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                "Andrew Ainsley",
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyLarge!
                                    .copyWith(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                          SizedBox(
                            height: 10,
                          ),
                          Divider(),
                          SizedBox(
                            height: 10,
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  Text(
                                    "12",
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyLarge!
                                        .copyWith(
                                            fontSize: 25,
                                            fontWeight: FontWeight.bold),
                                  ),
                                  SizedBox(
                                    height: 10,
                                  ),
                                  Text(
                                    "Events",
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyLarge!
                                        .copyWith(
                                          fontSize: 10,
                                          color: AppTheme.isLightTheme
                                              ? Theme.of(context).disabledColor
                                              : Colors.white,
                                          fontWeight: FontWeight.bold,
                                        ),
                                  )
                                ],
                              ),
                              Container(
                                height: 50,
                                width: 1,
                                color: Theme.of(context).dividerColor,
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    "7,389",
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyLarge!
                                        .copyWith(
                                            fontSize: 25,
                                            fontWeight: FontWeight.bold),
                                  ),
                                  SizedBox(
                                    height: 10,
                                  ),
                                  Text(
                                    "Followers",
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyLarge!
                                        .copyWith(
                                            fontSize: 10,
                                            color: AppTheme.isLightTheme
                                                ? Theme.of(context)
                                                    .disabledColor
                                                : Colors.white,
                                            fontWeight: FontWeight.bold),
                                  )
                                ],
                              ),
                              Container(
                                height: 20,
                                width: 1,
                                color: Theme.of(context).disabledColor,
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    "125",
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyLarge!
                                        .copyWith(
                                            fontSize: 25,
                                            fontWeight: FontWeight.bold),
                                  ),
                                  SizedBox(
                                    height: 10,
                                  ),
                                  Text(
                                    "Following",
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyLarge!
                                        .copyWith(
                                            fontSize: 10,
                                            color: AppTheme.isLightTheme
                                                ? Theme.of(context)
                                                    .disabledColor
                                                : Colors.white,
                                            fontWeight: FontWeight.bold),
                                  )
                                ],
                              ),
                            ],
                          ),
                          SizedBox(
                            height: 10,
                          ),
                          Divider(),
                          SizedBox(
                            height: 10,
                          ),
                          InkWell(
                              onTap: () {
                                // Navigator.push(
                                //   context,
                                //   MaterialPageRoute(
                                //     builder: (_) => SettimgEditProfile(),
                                //   ),
                                // );
                              },
                              child: com(
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p2
                                      : ConstanceData.dp2,
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p1
                                      : ConstanceData.dp1,
                                  "Manage Events")),
                          SizedBox(
                            height: 20,
                          ),
                          InkWell(
                              onTap: () {
                                // Navigator.push(
                                //   context,
                                //   MaterialPageRoute(
                                //     builder: (_) => SettingsAddress(),
                                //   ),
                                // );
                              },
                              child: com(
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p3
                                      : ConstanceData.dp3,
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p1
                                      : ConstanceData.dp1,
                                  "Message Center")),
                          SizedBox(
                            height: 10,
                          ),
                          Divider(),
                          SizedBox(
                            height: 10,
                          ),
                          InkWell(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => SettimgEditProfile(),
                                  ),
                                );
                              },
                              child: com(
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p4
                                      : ConstanceData.dp4,
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p1
                                      : ConstanceData.dp1,
                                  "Profile")),
                          SizedBox(
                            height: 20,
                          ),
                          InkWell(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => NotifiationScreen(),
                                  ),
                                );
                              },
                              child: com(
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p5
                                      : ConstanceData.dp5,
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p1
                                      : ConstanceData.dp1,
                                  "Notification")),
                          SizedBox(
                            height: 20,
                          ),
                          InkWell(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => SettingsPayment(),
                                  ),
                                );
                              },
                              child: com(
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p6
                                      : ConstanceData.dp6,
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p1
                                      : ConstanceData.dp1,
                                  "Payments")),
                          SizedBox(
                            height: 20,
                          ),
                          SizedBox(
                            height: 10,
                          ),
                          InkWell(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => LinkedAccountScreen(),
                                  ),
                                );
                              },
                              child: com(
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p7
                                      : ConstanceData.dp7,
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p1
                                      : ConstanceData.dp1,
                                  "Linked Accounts")),
                          SizedBox(
                            height: 20,
                          ),
                          InkWell(
                              onTap: () {
                                // Navigator.push(
                                //   context,
                                //   MaterialPageRoute(
                                //     builder: (_) => SettingsPayment(),
                                //   ),
                                // );
                              },
                              child: com(
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p8
                                      : ConstanceData.dp8,
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p1
                                      : ConstanceData.dp1,
                                  "Ticket Issues")),
                          SizedBox(
                            height: 20,
                          ),
                          InkWell(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => SettingSecurity(),
                                  ),
                                );
                              },
                              child: com(
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p9
                                      : ConstanceData.dp9,
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p1
                                      : ConstanceData.dp1,
                                  "Security")),
                          SizedBox(
                            height: 20,
                          ),
                          InkWell(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => SettingsLanguage(),
                                ),
                              );
                            },
                            child: Row(
                              children: [
                                Image.asset(
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p10
                                      : ConstanceData.dp10,
                                  height: 25,
                                ),
                                SizedBox(
                                  width: 10,
                                ),
                                Text(
                                  "Language",
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyLarge!
                                      .copyWith(
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
                                      ),
                                ),
                                Spacer(),
                                Text(
                                  "English (US)",
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyLarge!
                                      .copyWith(
                                        fontSize: 14,
                                      ),
                                ),
                                SizedBox(
                                  width: 5,
                                ),
                                Image.asset(
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p1
                                      : ConstanceData.dp1,
                                  height: 20,
                                ),
                              ],
                            ),
                          ),
                          SizedBox(
                            height: 20,
                          ),
                          com(
                              AppTheme.isLightTheme
                                  ? ConstanceData.p11
                                  : ConstanceData.dp11,
                              AppTheme.isLightTheme
                                  ? ConstanceData.p1
                                  : ConstanceData.dp1,
                              "Dark Mode",
                              isCupertinoBtn: true),
                          SizedBox(
                            height: 20,
                          ),
                          InkWell(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => SettingsHelpCenterFaq(),
                                  ),
                                );
                              },
                              child: com(
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p12
                                      : ConstanceData.dp12,
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p1
                                      : ConstanceData.dp1,
                                  "Help Center")),
                          SizedBox(
                            height: 20,
                          ),
                          InkWell(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => SettingsInviteFriens(),
                                  ),
                                );
                              },
                              child: com(
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p13
                                      : ConstanceData.dp13,
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p1
                                      : ConstanceData.dp1,
                                  "Invite Friends")),
                          SizedBox(
                            height: 20,
                          ),
                          InkWell(
                              onTap: () {
                                // Navigator.push(
                                //   context,
                                //   MaterialPageRoute(
                                //     builder: (_) => SettingsInviteFriens(),
                                //   ),
                                // );
                              },
                              child: com(
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p14
                                      : ConstanceData.dp14,
                                  AppTheme.isLightTheme
                                      ? ConstanceData.p1
                                      : ConstanceData.dp1,
                                  "Rate us")),
                          SizedBox(
                            height: 20,
                          ),
                          Row(
                            children: [
                              Image.asset(
                                ConstanceData.p15,
                                height: 25,
                              ),
                              SizedBox(
                                width: 10,
                              ),
                              InkWell(
                                onTap: (() {
                                  showModalBottomSheet<void>(
                                    context: context,
                                    builder: (BuildContext context) {
                                      return ListView(
                                        children: [
                                          Container(
                                            child: Padding(
                                              padding:
                                                  const EdgeInsets.all(8.0),
                                              child: Column(
                                                children: [
                                                  Container(
                                                    height: 3,
                                                    width: 30,
                                                    decoration: BoxDecoration(
                                                      color: Theme.of(context)
                                                          .dividerColor,
                                                      borderRadius:
                                                          BorderRadius.all(
                                                              Radius.circular(
                                                                  20)),
                                                    ),
                                                  ),
                                                  SizedBox(
                                                    height: 20,
                                                  ),
                                                  Text(
                                                    "Logout",
                                                    style: Theme.of(context)
                                                        .textTheme
                                                        .bodyLarge!
                                                        .copyWith(
                                                            fontSize: 20,
                                                            color: HexColor(
                                                                "#F75555"),
                                                            fontWeight:
                                                                FontWeight
                                                                    .bold),
                                                  ),
                                                  SizedBox(
                                                    height: 20,
                                                  ),
                                                  Divider(),
                                                  SizedBox(
                                                    height: 20,
                                                  ),
                                                  SizedBox(
                                                    height: 10,
                                                  ),
                                                  Text(
                                                    "Are you sure you want to log out?",
                                                    style: Theme.of(context)
                                                        .textTheme
                                                        .bodyLarge!
                                                        .copyWith(
                                                            fontSize: 14,
                                                            fontWeight:
                                                                FontWeight
                                                                    .bold),
                                                  ),
                                                  SizedBox(
                                                    height: 40,
                                                  ),
                                                  Row(
                                                    children: [
                                                      Expanded(
                                                        child: InkWell(
                                                          onTap: () {
                                                            Navigator.pop(
                                                                context);
                                                          },
                                                          child: Container(
                                                            height: 50,
                                                            width:
                                                                double.infinity,
                                                            decoration:
                                                                BoxDecoration(
                                                              color: Theme.of(
                                                                      context)
                                                                  .dividerColor,
                                                              borderRadius: BorderRadius
                                                                  .all(Radius
                                                                      .circular(
                                                                          28)),
                                                            ),
                                                            child: Center(
                                                              child: Text(
                                                                "Cancel",
                                                                style: Theme.of(
                                                                        context)
                                                                    .textTheme
                                                                    .bodyLarge!
                                                                    .copyWith(
                                                                      fontSize:
                                                                          12,
                                                                      fontWeight:
                                                                          FontWeight
                                                                              .bold,
                                                                    ),
                                                              ),
                                                            ),
                                                          ),
                                                        ),
                                                      ),
                                                      SizedBox(
                                                        width: 10,
                                                      ),
                                                      Expanded(
                                                        child: InkWell(
                                                          onTap: () {
                                                            Navigator.pop(
                                                                context);
                                                          },
                                                          child: InkWell(
                                                            onTap: () {
                                                              Navigator.push(
                                                                context,
                                                                MaterialPageRoute(
                                                                  builder: (_) =>
                                                                      CreateNewAccountScreen(),
                                                                ),
                                                              );
                                                            },
                                                            child: Container(
                                                              height: 50,
                                                              width: double
                                                                  .infinity,
                                                              decoration:
                                                                  BoxDecoration(
                                                                color: Theme.of(
                                                                        context)
                                                                    .primaryColor,
                                                                borderRadius: BorderRadius
                                                                    .all(Radius
                                                                        .circular(
                                                                            28)),
                                                              ),
                                                              child: Center(
                                                                child: Text(
                                                                  "Yes, Logout",
                                                                  style: Theme.of(
                                                                          context)
                                                                      .textTheme
                                                                      .bodyLarge!
                                                                      .copyWith(
                                                                        fontSize:
                                                                            12,
                                                                        fontWeight:
                                                                            FontWeight.bold,
                                                                        color: Colors
                                                                            .white,
                                                                      ),
                                                                ),
                                                              ),
                                                            ),
                                                          ),
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                  SizedBox(
                                                    height: 30,
                                                  ),
                                                ],
                                              ),
                                            ),
                                            decoration: BoxDecoration(
                                              color: AppTheme.isLightTheme
                                                  ? Colors.white
                                                  : HexColor("#35383F"),
                                              border: Border.all(
                                                  color: HexColor("#EBEBF0")),
                                              borderRadius: BorderRadius.only(
                                                topLeft:
                                                    const Radius.circular(25.0),
                                                topRight:
                                                    const Radius.circular(25.0),
                                              ),
                                            ),
                                          ),
                                        ],
                                      );
                                    },
                                  );
                                }),
                                child: Text(
                                  "Logout",
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyLarge!
                                      .copyWith(
                                        fontSize: 14,
                                        color: HexColor("#F75555"),
                                        fontWeight: FontWeight.bold,
                                      ),
                                ),
                              ),
                            ],
                          ),
                          SizedBox(
                            height: 60,
                          )
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget com(String img, String img2, tex, {bool isCupertinoBtn = false}) {
    return Row(
      children: [
        Image.asset(
          img,
          height: 25,
        ),
        SizedBox(
          width: 10,
        ),
        Text(
          tex,
          style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
        ),
        Spacer(),
        isCupertinoBtn
            ? CupertinoSwitch(
                value: isdark,
                activeColor: Theme.of(context).primaryColor,
                onChanged: (bool? value) {
                  setState(() {
                    isdark = value!;
                  });
                  if (isdark) {
                    MyApp.setCustomeTheme(context, 7);
                  } else {
                    MyApp.setCustomeTheme(context, 6);
                  }
                },
              )
            : Image.asset(
                img2,
                height: 20,
              )
      ],
    );
  }
}
