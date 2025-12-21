// ignore_for_file: prefer_const_constructors, deprecated_member_use

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:eveno/Widget/buttons.dart';
import 'package:eveno/auth/photo_ID_card.dart';
import 'package:flutter/material.dart';

class SetYourLocationScreen extends StatefulWidget {
  const SetYourLocationScreen({super.key});

  @override
  State<SetYourLocationScreen> createState() => _SetYourLocationScreenState();
}

class _SetYourLocationScreenState extends State<SetYourLocationScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Padding(
            padding: EdgeInsets.only(
                left: 16,
                right: 16,
                top: MediaQuery.of(context).padding.top + 16,
                bottom: 16),
            child: Row(
              children: [
                InkWell(
                  onTap: () {
                    Navigator.pop(context);
                  },
                  child: Image.asset(
                    AppTheme.isLightTheme
                        ? ConstanceData.s1
                        : ConstanceData.ds1,
                    height: 30,
                  ),
                ),
                SizedBox(
                  width: 10,
                ),
                Text(
                  "Fill Your Profile",
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
          ),
          Stack(
            alignment: Alignment.bottomCenter,
            children: [
              Image.asset(
                AppTheme.isLightTheme ? ConstanceData.s17 : ConstanceData.ds17,
                fit: BoxFit.cover,
                height: MediaQuery.of(context).size.height -
                    MediaQuery.of(context).padding.top -
                    AppBar().preferredSize.height -
                    14,
                width: MediaQuery.of(context).size.width,
              ),
              Container(
                height: 300,
                decoration: BoxDecoration(
                  color: AppTheme.isLightTheme
                      ? Colors.white
                      : HexColor("#35383F"),
                  borderRadius: BorderRadius.all(Radius.circular(30)),
                ),
                child: Padding(
                  padding: EdgeInsets.only(
                      left: 16,
                      right: 16,
                      bottom: MediaQuery.of(context).padding.bottom + 16),
                  child: Column(
                    children: [
                      SizedBox(
                        height: 10,
                      ),
                      Container(
                        height: 5,
                        width: 60,
                        decoration: BoxDecoration(
                          color: Theme.of(context).dividerColor,
                          // border: Border.all(
                          //   color: Theme.of(context).dividerColor,
                          // ),
                          borderRadius: BorderRadius.all(Radius.circular(30)),
                        ),
                      ),
                      SizedBox(
                        height: 30,
                      ),
                      Expanded(
                        child: ListView(
                          padding: EdgeInsets.zero,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  "Location",
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyLarge!
                                      .copyWith(
                                        fontSize: 22,
                                        fontWeight: FontWeight.bold,
                                      ),
                                ),
                              ],
                            ),
                            SizedBox(
                              height: 20,
                            ),
                            Divider(),
                            SizedBox(
                              height: 20,
                            ),
                            Row(
                              children: [
                                Text(
                                  "Times Square NYC, Manhattan",
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyLarge!
                                      .copyWith(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                      ),
                                ),
                                Spacer(),
                                Image.asset(
                                  AppTheme.isLightTheme
                                      ? ConstanceData.s18
                                      : ConstanceData.ds18,
                                  height: 20,
                                )
                              ],
                            ),
                            SizedBox(
                              height: 10,
                            ),
                            Divider(),
                            SizedBox(
                              height: 10,
                            ),
                          ],
                        ),
                      ),
                      MyButton(
                          btnName: "Continue",
                          click: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => PhotoIDCardScreen(),
                              ),
                            );
                          })
                    ],
                  ),
                ),
              )
            ],
          ),

          // Stack(
          //   alignment: Alignment.bottomCenter,
          //   children: [
          //     Image.asset(
          //       AppTheme.isLightTheme ? ConstanceData.s17 : ConstanceData.ds17,
          //       fit: BoxFit.cover,
          //     ),
          //     Container(
          //       height: 800,
          //       decoration: BoxDecoration(
          //         color: AppTheme.isLightTheme
          //             ? Colors.white
          //             : HexColor("#35383F"),
          //         // border: Border.all(
          //         //   color: Theme.of(context).dividerColor,
          //         // ),
          //         borderRadius: BorderRadius.all(Radius.circular(30)),
          //       ),
          //       child: Padding(
          //         padding: EdgeInsets.only(
          //             left: 16,
          //             right: 16,
          //             bottom: MediaQuery.of(context).padding.bottom + 16),
          //         child: Column(
          //           children: [
          //             SizedBox(
          //               height: 10,
          //             ),
          //             Container(
          //               height: 5,
          //               width: 60,
          //               decoration: BoxDecoration(
          //                 color: Theme.of(context).dividerColor,
          //                 // border: Border.all(
          //                 //   color: Theme.of(context).dividerColor,
          //                 // ),
          //                 borderRadius: BorderRadius.all(Radius.circular(30)),
          //               ),
          //             ),
          //             SizedBox(
          //               height: 30,
          //             ),
          //             Expanded(
          //               child: ListView(
          //                 padding: EdgeInsets.zero,
          //                 children: [
          //                   Row(
          //                     mainAxisAlignment: MainAxisAlignment.center,
          //                     children: [
          //                       Text(
          //                         "Location",
          //                         style: Theme.of(context)
          //                             .textTheme
          //                             .bodyText1!
          //                             .copyWith(
          //                               fontSize: 22,
          //                               fontWeight: FontWeight.bold,
          //                             ),
          //                       ),
          //                     ],
          //                   ),
          //                   SizedBox(
          //                     height: 20,
          //                   ),
          //                   Divider(),
          //                   SizedBox(
          //                     height: 20,
          //                   ),
          //                   Row(
          //                     children: [
          //                       Text(
          //                         "Times Square NYC, Manhattan",
          //                         style: Theme.of(context)
          //                             .textTheme
          //                             .bodyText1!
          //                             .copyWith(
          //                               fontSize: 12,
          //                               fontWeight: FontWeight.bold,
          //                             ),
          //                       ),
          //                       Spacer(),
          //                       Image.asset(
          //                         AppTheme.isLightTheme
          //                             ? ConstanceData.s18
          //                             : ConstanceData.ds18,
          //                         height: 20,
          //                       )
          //                     ],
          //                   ),
          //                   SizedBox(
          //                     height: 10,
          //                   ),
          //                   Divider(),
          //                   SizedBox(
          //                     height: 10,
          //                   ),
          //                 ],
          //               ),
          //             ),
          //             MyButton(
          //                 btnName: "Continue",
          //                 click: () {
          //                   Navigator.push(
          //                     context,
          //                     MaterialPageRoute(
          //                       builder: (_) => PhotoIDCardScreen(),
          //                     ),
          //                   );
          //                 })
          //           ],
          //         ),
          //       ),
          //     )
          //   ],
          // )
        ],
      ),
    );
  }
}
