// ignore_for_file: prefer_const_constructors_in_immutables, prefer_const_constructors, prefer_const_literals_to_create_immutables, deprecated_member_use, file_names

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:eveno/Widget/textFiealds.dart';
import 'package:flutter/material.dart';

class SettingsHelpCenterFaq extends StatefulWidget {
  SettingsHelpCenterFaq({Key? key}) : super(key: key);

  @override
  State<SettingsHelpCenterFaq> createState() => _SettingsHelpCenterFaqState();
}

class _SettingsHelpCenterFaqState extends State<SettingsHelpCenterFaq> {
  int pageNumber = 0;
  final PageController _pageController = PageController();
  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
                  "Help Center",
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                Spacer(),
                Image.asset(
                  AppTheme.isLightTheme
                      ? ConstanceData.n52
                      : ConstanceData.dn52,
                  height: 25,
                )
              ],
            ),
            SizedBox(
              height: 40,
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                InkWell(
                  onTap: () {
                    setState(() {
                      _pageController.jumpToPage(0);
                    });
                  },
                  child: Text(
                    "FAQ",
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 14,
                        color: pageNumber == 0
                            ? AppTheme.isLightTheme
                                ? Theme.of(context).primaryColor
                                : Colors.white
                            : AppTheme.isLightTheme
                                ? HexColor("#B2BAC6")
                                : HexColor("#616161"),
                        fontWeight: FontWeight.bold),
                  ),
                ),
                InkWell(
                  onTap: () {
                    setState(() {
                      _pageController.jumpToPage(1);
                    });
                  },
                  child: Text(
                    "Contact us",
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 14,
                        color: pageNumber == 1
                            ? AppTheme.isLightTheme
                                ? Theme.of(context).primaryColor
                                : Colors.white
                            : AppTheme.isLightTheme
                                ? HexColor("#B2BAC6")
                                : HexColor("#616161"),
                        fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            SizedBox(
              height: 20,
            ),
            Divider(),
            SizedBox(
              height: 10,
            ),
            Expanded(
              flex: 2,
              child: PageView(
                controller: _pageController,
                physics: BouncingScrollPhysics(),
                onPageChanged: (value) {
                  setState(() {
                    pageNumber = value;
                  });
                },
                children: [
                  //****************** *
                  ListView(
                    padding: EdgeInsets.all(8),
                    children: [
                      Column(
                        children: [
                          SizedBox(
                            height: 50,
                            child: ListView(
                              scrollDirection: Axis.horizontal,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      height: 40,
                                      width: 100,
                                      decoration: BoxDecoration(
                                        color: AppTheme.isLightTheme
                                            ? Theme.of(context).primaryColor
                                            : HexColor("#35383F"),
                                        borderRadius: BorderRadius.all(
                                            Radius.circular(20)),
                                      ),
                                      child: Center(
                                        child: Text(
                                          "General",
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodyLarge!
                                              .copyWith(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.bold,
                                                  color: Colors.white),
                                        ),
                                      ),
                                    ),
                                    SizedBox(
                                      width: 10,
                                    ),
                                    Container(
                                      height: 40,
                                      width: 100,
                                      decoration: BoxDecoration(
                                        border: Border.all(
                                            color: AppTheme.isLightTheme
                                                ? Theme.of(context).primaryColor
                                                : HexColor("#35383F"),
                                            width: 2),
                                        borderRadius: BorderRadius.all(
                                            Radius.circular(20)),
                                      ),
                                      child: Center(
                                        child: Text(
                                          "Account",
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodyLarge!
                                              .copyWith(
                                                fontSize: 14,
                                                fontWeight: FontWeight.bold,
                                              ),
                                        ),
                                      ),
                                    ),
                                    SizedBox(
                                      width: 10,
                                    ),
                                    Container(
                                      height: 40,
                                      width: 100,
                                      decoration: BoxDecoration(
                                        border: Border.all(
                                            color: AppTheme.isLightTheme
                                                ? Theme.of(context).primaryColor
                                                : HexColor("#35383F"),
                                            width: 2),
                                        borderRadius: BorderRadius.all(
                                            Radius.circular(20)),
                                      ),
                                      child: Center(
                                        child: Text(
                                          "Service",
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodyLarge!
                                              .copyWith(
                                                fontSize: 14,
                                                fontWeight: FontWeight.bold,
                                              ),
                                        ),
                                      ),
                                    ),
                                    SizedBox(
                                      width: 10,
                                    ),
                                    Container(
                                      height: 40,
                                      width: 100,
                                      decoration: BoxDecoration(
                                        border: Border.all(
                                            color: AppTheme.isLightTheme
                                                ? Theme.of(context).primaryColor
                                                : HexColor("#35383F"),
                                            width: 2),
                                        borderRadius: BorderRadius.all(
                                            Radius.circular(20)),
                                      ),
                                      child: Center(
                                        child: Text(
                                          "Payment",
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodyLarge!
                                              .copyWith(
                                                fontSize: 14,
                                                fontWeight: FontWeight.bold,
                                              ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          SizedBox(
                            height: 20,
                          ),
                          MyTextFieald(
                            hintText: "Search",
                            prefixIcon: IconButton(
                              icon: AppTheme.isLightTheme
                                  ? Image.asset(
                                      ConstanceData.n6,
                                      height: 20,
                                    )
                                  : Image.asset(
                                      ConstanceData.n6,
                                      height: 20,
                                    ),
                              onPressed: () {},
                            ),
                            click: () {},
                            suffixIcon: IconButton(
                              icon: AppTheme.isLightTheme
                                  ? Image.asset(
                                      ConstanceData.h9,
                                      height: 25,
                                    )
                                  : Image.asset(
                                      ConstanceData.h9,
                                      height: 25,
                                    ),
                              onPressed: () {},
                            ),
                          ),
                          SizedBox(
                            height: 20,
                          ),
                          Container(
                            height: 150,
                            width: double.infinity,
                            decoration: BoxDecoration(
                              boxShadow: [
                                BoxShadow(
                                  color: AppTheme.isLightTheme
                                      ? Color.fromARGB(255, 231, 231, 231)
                                      : Colors.transparent,
                                  blurRadius: 6.0,
                                  spreadRadius: 2.0,
                                  offset: Offset(0.0, 0.0),
                                )
                              ],
                              color: Theme.of(context).cardColor,
                              borderRadius:
                                  BorderRadius.all(Radius.circular(20)),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        "What is Carea?",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyLarge!
                                            .copyWith(
                                              fontSize: 14,
                                              fontWeight: FontWeight.bold,
                                            ),
                                      ),
                                      Spacer(),
                                      Image.asset(
                                        AppTheme.isLightTheme
                                            ? ConstanceData.r15
                                            : ConstanceData.r15,
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
                                  Text(
                                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyLarge!
                                        .copyWith(
                                          fontSize: 12,
                                          color:
                                              Theme.of(context).disabledColor,
                                        ),
                                  )
                                ],
                              ),
                            ),
                          ),
                          SizedBox(
                            height: 20,
                          ),
                          Container(
                            height: 60,
                            width: double.infinity,
                            decoration: BoxDecoration(
                              boxShadow: [
                                BoxShadow(
                                  color: AppTheme.isLightTheme
                                      ? Color.fromARGB(255, 231, 231, 231)
                                      : Colors.transparent,
                                  blurRadius: 6.0,
                                  spreadRadius: 2.0,
                                  offset: Offset(0.0, 0.0),
                                )
                              ],
                              color: Theme.of(context).cardColor,
                              borderRadius:
                                  BorderRadius.all(Radius.circular(20)),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        "How to use Carea?",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyLarge!
                                            .copyWith(
                                              fontSize: 14,
                                              fontWeight: FontWeight.bold,
                                            ),
                                      ),
                                      Spacer(),
                                      Image.asset(
                                        AppTheme.isLightTheme
                                            ? ConstanceData.r15
                                            : ConstanceData.r15,
                                        height: 20,
                                      )
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                          SizedBox(
                            height: 20,
                          ),
                          Container(
                            height: 60,
                            width: double.infinity,
                            decoration: BoxDecoration(
                              boxShadow: [
                                BoxShadow(
                                  color: AppTheme.isLightTheme
                                      ? Color.fromARGB(255, 231, 231, 231)
                                      : Colors.transparent,
                                  blurRadius: 6.0,
                                  spreadRadius: 2.0,
                                  offset: Offset(0.0, 0.0),
                                )
                              ],
                              color: Theme.of(context).cardColor,
                              borderRadius:
                                  BorderRadius.all(Radius.circular(20)),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        "How do I cancel an orders?",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyLarge!
                                            .copyWith(
                                              fontSize: 14,
                                              fontWeight: FontWeight.bold,
                                            ),
                                      ),
                                      Spacer(),
                                      Image.asset(
                                        AppTheme.isLightTheme
                                            ? ConstanceData.r15
                                            : ConstanceData.r15,
                                        height: 20,
                                      )
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                          SizedBox(
                            height: 20,
                          ),
                          Container(
                            height: 60,
                            width: double.infinity,
                            decoration: BoxDecoration(
                              boxShadow: [
                                BoxShadow(
                                  color: AppTheme.isLightTheme
                                      ? Color.fromARGB(255, 231, 231, 231)
                                      : Colors.transparent,
                                  blurRadius: 6.0,
                                  spreadRadius: 2.0,
                                  offset: Offset(0.0, 0.0),
                                )
                              ],
                              color: Theme.of(context).cardColor,
                              borderRadius:
                                  BorderRadius.all(Radius.circular(20)),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        "Can I get a discount at checkout?",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyLarge!
                                            .copyWith(
                                              fontSize: 14,
                                              fontWeight: FontWeight.bold,
                                            ),
                                      ),
                                      Spacer(),
                                      Image.asset(
                                        AppTheme.isLightTheme
                                            ? ConstanceData.r15
                                            : ConstanceData.r15,
                                        height: 20,
                                      )
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                          SizedBox(
                            height: 20,
                          ),
                          Container(
                            height: 60,
                            width: double.infinity,
                            decoration: BoxDecoration(
                              boxShadow: [
                                BoxShadow(
                                  color: AppTheme.isLightTheme
                                      ? Color.fromARGB(255, 231, 231, 231)
                                      : Colors.transparent,
                                  blurRadius: 6.0,
                                  spreadRadius: 2.0,
                                  offset: Offset(0.0, 0.0),
                                )
                              ],
                              color: Theme.of(context).cardColor,
                              borderRadius:
                                  BorderRadius.all(Radius.circular(20)),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        "Why can't I make a payment?",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyLarge!
                                            .copyWith(
                                              fontSize: 14,
                                              fontWeight: FontWeight.bold,
                                            ),
                                      ),
                                      Spacer(),
                                      Image.asset(
                                        AppTheme.isLightTheme
                                            ? ConstanceData.r15
                                            : ConstanceData.r15,
                                        height: 20,
                                      )
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                          SizedBox(
                            height: 20,
                          ),
                        ],
                      ),
                    ],
                  ),
                  // *******************
                  ListView(
                    padding: EdgeInsets.all(8),
                    children: [
                      Column(
                        children: [
                          com(
                              AppTheme.isLightTheme
                                  ? ConstanceData.r16
                                  : ConstanceData.r16,
                              "Customer Service"),
                          SizedBox(
                            height: 20,
                          ),
                          com(
                              AppTheme.isLightTheme
                                  ? ConstanceData.r17
                                  : ConstanceData.r17,
                              "WhatsApp"),
                          SizedBox(
                            height: 20,
                          ),
                          com(
                              AppTheme.isLightTheme
                                  ? ConstanceData.r18
                                  : ConstanceData.r18,
                              "Website"),
                          SizedBox(
                            height: 20,
                          ),
                          com(
                              AppTheme.isLightTheme
                                  ? ConstanceData.r19
                                  : ConstanceData.r19,
                              "Facebook"),
                          SizedBox(
                            height: 20,
                          ),
                          com(
                              AppTheme.isLightTheme
                                  ? ConstanceData.r20
                                  : ConstanceData.r20,
                              "Twitter"),
                          SizedBox(
                            height: 20,
                          ),
                          com(
                              AppTheme.isLightTheme
                                  ? ConstanceData.r21
                                  : ConstanceData.r21,
                              "Instagram"),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget com(String img, String tex) {
    return InkWell(
      onTap: () {
        // Navigator.push(
        //   context,
        //   MaterialPageRoute(
        //     builder: (_) => SettingHelpCentrContactC(),
        //   ),
        // );
      },
      child: Container(
        height: 60,
        width: double.infinity,
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: AppTheme.isLightTheme
                  ? Color.fromARGB(255, 231, 231, 231)
                  : Colors.transparent,
              blurRadius: 6.0,
              spreadRadius: 2.0,
              offset: Offset(0.0, 0.0),
            )
          ],
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.all(Radius.circular(20)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Row(
                children: [
                  Image.asset(
                    img,
                    height: 20,
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
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
