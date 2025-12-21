// ignore_for_file: prefer_const_constructors, deprecated_member_use, prefer_const_literals_to_create_immutables, sort_child_properties_last, file_names

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:eveno/Widget/textFiealds.dart';
import 'package:eveno/home/38_event_details_full_page.dart';
import 'package:flutter/material.dart';

class SerchResultsListScreen extends StatefulWidget {
  const SerchResultsListScreen({super.key});

  @override
  State<SerchResultsListScreen> createState() => _SerchResultsListScreenState();
}

class _SerchResultsListScreenState extends State<SerchResultsListScreen> {
  int pageNumber = 0;
  final PageController _pageController = PageController();
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: EdgeInsets.only(
            left: 16,
            right: 16,
            top: MediaQuery.of(context).padding.top + 20,
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
                Expanded(
                  child: MyTextFieald(
                    hintText: "Search",
                    prefixIcon: IconButton(
                      icon: AppTheme.isLightTheme
                          ? Image.asset(
                              ConstanceData.h8,
                              height: 20,
                            )
                          : Image.asset(
                              ConstanceData.h8,
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
                      onPressed: () {
                        showModalBottomSheet<void>(
                          backgroundColor: AppTheme.isLightTheme
                              ? Colors.white
                              : Colors.black,
                          context: context,
                          builder: (BuildContext context) {
                            return ListView(
                              children: [
                                Container(
                                  child: Padding(
                                    padding: const EdgeInsets.all(8.0),
                                    child: Column(
                                      children: [
                                        Container(
                                          height: 3,
                                          width: 30,
                                          decoration: BoxDecoration(
                                            color:
                                                Theme.of(context).dividerColor,
                                            borderRadius: BorderRadius.all(
                                                Radius.circular(20)),
                                          ),
                                        ),
                                        SizedBox(
                                          height: 20,
                                        ),
                                        Text(
                                          "Filter",
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodyLarge!
                                              .copyWith(
                                                  fontSize: 20,
                                                  fontWeight: FontWeight.bold),
                                        ),
                                        SizedBox(
                                          height: 20,
                                        ),
                                        Divider(),
                                        SizedBox(
                                          height: 20,
                                        ),
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Text(
                                              "Event Category",
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodyLarge!
                                                  .copyWith(
                                                      fontSize: 14,
                                                      fontWeight:
                                                          FontWeight.bold),
                                            ),
                                            Spacer(),
                                            Text(
                                              "See All",
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodyLarge!
                                                  .copyWith(
                                                      fontSize: 14,
                                                      color: Theme.of(context)
                                                          .primaryColor,
                                                      fontWeight:
                                                          FontWeight.bold),
                                            ),
                                          ],
                                        ),
                                        SizedBox(
                                          height: 20,
                                        ),
                                        Row(
                                          children: [
                                            Container(
                                              height: 35,
                                              width: 60,
                                              decoration: BoxDecoration(
                                                border: Border.all(
                                                    color: Theme.of(context)
                                                        .primaryColor,
                                                    width: 2),
                                                borderRadius: BorderRadius.all(
                                                    Radius.circular(20)),
                                              ),
                                              child: Center(
                                                child: Text(
                                                  "✅ All",
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .bodyLarge!
                                                      .copyWith(
                                                          fontSize: 10,
                                                          fontWeight:
                                                              FontWeight.bold,
                                                          color: Theme.of(
                                                                  context)
                                                              .primaryColor),
                                                ),
                                              ),
                                            ),
                                            SizedBox(
                                              width: 10,
                                            ),
                                            Container(
                                              height: 35,
                                              width: 80,
                                              decoration: BoxDecoration(
                                                color: Theme.of(context)
                                                    .primaryColor,
                                                borderRadius: BorderRadius.all(
                                                    Radius.circular(20)),
                                              ),
                                              child: Center(
                                                child: Text(
                                                  "🎵 Music",
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .bodyLarge!
                                                      .copyWith(
                                                        fontSize: 10,
                                                        color: Colors.white,
                                                        fontWeight:
                                                            FontWeight.bold,
                                                      ),
                                                ),
                                              ),
                                            ),
                                            SizedBox(
                                              width: 10,
                                            ),
                                            Container(
                                              height: 35,
                                              width: 100,
                                              decoration: BoxDecoration(
                                                border: Border.all(
                                                    color: Theme.of(context)
                                                        .primaryColor,
                                                    width: 2),
                                                borderRadius: BorderRadius.all(
                                                    Radius.circular(20)),
                                              ),
                                              child: Center(
                                                child: Text(
                                                  "💼 Workshops",
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .bodyLarge!
                                                      .copyWith(
                                                        fontSize: 10,
                                                        fontWeight:
                                                            FontWeight.bold,
                                                        color: Theme.of(context)
                                                            .primaryColor,
                                                      ),
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        SizedBox(
                                          height: 10,
                                        ),
                                        Row(
                                          children: [
                                            Container(
                                              height: 35,
                                              width: 70,
                                              decoration: BoxDecoration(
                                                border: Border.all(
                                                    color: Theme.of(context)
                                                        .primaryColor,
                                                    width: 2),
                                                borderRadius: BorderRadius.all(
                                                    Radius.circular(20)),
                                              ),
                                              child: Center(
                                                child: Text(
                                                  "🎨 Art",
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .bodyLarge!
                                                      .copyWith(
                                                          fontSize: 10,
                                                          fontWeight:
                                                              FontWeight.bold,
                                                          color: Theme.of(
                                                                  context)
                                                              .primaryColor),
                                                ),
                                              ),
                                            ),
                                            SizedBox(
                                              width: 10,
                                            ),
                                            Container(
                                              height: 35,
                                              width: 110,
                                              decoration: BoxDecoration(
                                                border: Border.all(
                                                    color: Theme.of(context)
                                                        .primaryColor,
                                                    width: 2),
                                                borderRadius: BorderRadius.all(
                                                    Radius.circular(20)),
                                              ),
                                              child: Center(
                                                child: Text(
                                                  "🍕 Food & Drink",
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .bodyLarge!
                                                      .copyWith(
                                                        fontSize: 10,
                                                        color: Theme.of(context)
                                                            .primaryColor,
                                                        fontWeight:
                                                            FontWeight.bold,
                                                      ),
                                                ),
                                              ),
                                            ),
                                            SizedBox(
                                              width: 10,
                                            ),
                                            Container(
                                              height: 35,
                                              width: 100,
                                              decoration: BoxDecoration(
                                                border: Border.all(
                                                    color: Theme.of(context)
                                                        .primaryColor,
                                                    width: 2),
                                                borderRadius: BorderRadius.all(
                                                    Radius.circular(20)),
                                              ),
                                              child: Center(
                                                child: Text(
                                                  "🧥 Fashion",
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .bodyLarge!
                                                      .copyWith(
                                                        fontSize: 10,
                                                        fontWeight:
                                                            FontWeight.bold,
                                                        color: Theme.of(context)
                                                            .primaryColor,
                                                      ),
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        SizedBox(
                                          height: 20,
                                        ),
                                        Row(
                                          children: [
                                            Text(
                                              "Ticket Price Range",
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodyLarge!
                                                  .copyWith(
                                                      fontSize: 14,
                                                      fontWeight:
                                                          FontWeight.bold),
                                            )
                                          ],
                                        ),
                                        SizedBox(
                                          height: 20,
                                        ),
                                        Image.asset(
                                          AppTheme.isLightTheme
                                              ? ConstanceData.n15
                                              : ConstanceData.dn15,
                                          width:
                                              MediaQuery.of(context).size.width,
                                          fit: BoxFit.cover,
                                        ),
                                        SizedBox(
                                          height: 20,
                                        ),
                                        Row(
                                          children: [
                                            Text(
                                              "Location",
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodyLarge!
                                                  .copyWith(
                                                      fontSize: 14,
                                                      fontWeight:
                                                          FontWeight.bold),
                                            )
                                          ],
                                        ),
                                        SizedBox(
                                          height: 20,
                                        ),
                                        MyTextFieald(
                                          hintText: "New York, United States",
                                          prefixIcon: null,
                                          click: () {},
                                          suffixIcon: IconButton(
                                            icon: AppTheme.isLightTheme
                                                ? Image.asset(
                                                    ConstanceData.s16,
                                                    height: 20,
                                                  )
                                                : Image.asset(
                                                    ConstanceData.s16,
                                                    height: 20,
                                                  ),
                                            onPressed: () {},
                                          ),

                                          // click: click
                                        ),
                                        SizedBox(
                                          height: 20,
                                        ),
                                        Row(
                                          children: [
                                            Text(
                                              "Event Location Range (km)",
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodyLarge!
                                                  .copyWith(
                                                      fontSize: 14,
                                                      fontWeight:
                                                          FontWeight.bold),
                                            )
                                          ],
                                        ),
                                        SizedBox(
                                          height: 20,
                                        ),
                                        Image.asset(
                                          AppTheme.isLightTheme
                                              ? ConstanceData.n16
                                              : ConstanceData.dn16,
                                          width:
                                              MediaQuery.of(context).size.width,
                                          fit: BoxFit.cover,
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
                                            Expanded(
                                              child: Container(
                                                height: 50,
                                                decoration: BoxDecoration(
                                                  color: HexColor("#EEEDFE"),
                                                  borderRadius:
                                                      BorderRadius.all(
                                                          Radius.circular(25)),
                                                ),
                                                child: Center(
                                                  child: Text(
                                                    "Reset",
                                                    style: Theme.of(context)
                                                        .textTheme
                                                        .bodyLarge!
                                                        .copyWith(
                                                          fontSize: 14,
                                                          color:
                                                              Theme.of(context)
                                                                  .primaryColor,
                                                          fontWeight:
                                                              FontWeight.bold,
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
                                                  Navigator.pop(context);
                                                },
                                                child: Container(
                                                  height: 50,
                                                  width: 100,
                                                  decoration: BoxDecoration(
                                                    color: Theme.of(context)
                                                        .primaryColor,
                                                    borderRadius:
                                                        BorderRadius.all(
                                                            Radius.circular(
                                                                25)),
                                                  ),
                                                  child: Center(
                                                    child: Text(
                                                      "Apply",
                                                      style: Theme.of(context)
                                                          .textTheme
                                                          .bodyLarge!
                                                          .copyWith(
                                                            fontSize: 12,
                                                            fontWeight:
                                                                FontWeight.bold,
                                                            color: Colors.white,
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
                                        )
                                      ],
                                    ),
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppTheme.isLightTheme
                                        ? Colors.white
                                        : HexColor("#1F222A"),
                                    border:
                                        Border.all(color: HexColor("#EBEBF0")),
                                    borderRadius: BorderRadius.only(
                                      topLeft: const Radius.circular(25.0),
                                      topRight: const Radius.circular(25.0),
                                    ),
                                  ),
                                ),
                              ],
                            );
                          },
                        );
                      },
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(
              height: 20,
            ),
            SizedBox(
              height: 60,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  Row(
                    children: [
                      Container(
                        height: 35,
                        width: 60,
                        decoration: BoxDecoration(
                          color: Theme.of(context).primaryColor,
                          borderRadius: BorderRadius.all(Radius.circular(20)),
                        ),
                        child: Center(
                          child: Text(
                            "✅ All",
                            style: Theme.of(context)
                                .textTheme
                                .bodyLarge!
                                .copyWith(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white),
                          ),
                        ),
                      ),
                      SizedBox(
                        width: 10,
                      ),
                      Container(
                        height: 35,
                        width: 100,
                        decoration: BoxDecoration(
                          border: Border.all(
                              color: Theme.of(context).primaryColor, width: 2),
                          borderRadius: BorderRadius.all(Radius.circular(20)),
                        ),
                        child: Center(
                          child: Text(
                            "🎵 Music",
                            style:
                                Theme.of(context).textTheme.bodyLarge!.copyWith(
                                      fontSize: 12,
                                      color: Theme.of(context).primaryColor,
                                      fontWeight: FontWeight.bold,
                                    ),
                          ),
                        ),
                      ),
                      SizedBox(
                        width: 10,
                      ),
                      Container(
                        height: 35,
                        width: 80,
                        decoration: BoxDecoration(
                          border: Border.all(
                              color: Theme.of(context).primaryColor, width: 2),
                          borderRadius: BorderRadius.all(Radius.circular(20)),
                        ),
                        child: Center(
                          child: Text(
                            "🎨 Art",
                            style:
                                Theme.of(context).textTheme.bodyLarge!.copyWith(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: Theme.of(context).primaryColor,
                                    ),
                          ),
                        ),
                      ),
                      SizedBox(
                        width: 10,
                      ),
                      Container(
                        height: 35,
                        width: 120,
                        decoration: BoxDecoration(
                          border: Border.all(
                              color: Theme.of(context).primaryColor, width: 2),
                          borderRadius: BorderRadius.all(Radius.circular(20)),
                        ),
                        child: Center(
                          child: Text(
                            "💼 Workshops",
                            style:
                                Theme.of(context).textTheme.bodyLarge!.copyWith(
                                      fontSize: 12,
                                      color: Theme.of(context).primaryColor,
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
            Row(
              children: [
                Text(
                  "978 founds",
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                Spacer(),
                InkWell(
                  onTap: () {
                    _pageController.jumpToPage(0);
                    pageNumber = 0;
                    setState(() {});
                  },
                  child: Image.asset(
                    ConstanceData.n7,
                    height: 22,
                    color: pageNumber == 0
                        ? Theme.of(context).primaryColor
                        : Theme.of(context).disabledColor,
                  ),
                ),
                SizedBox(
                  width: 10,
                ),
                InkWell(
                  onTap: () {
                    _pageController.jumpToPage(1);
                    pageNumber = 1;
                    setState(() {});
                  },
                  child: Image.asset(
                    ConstanceData.n8,
                    height: 22,
                    color: pageNumber == 1
                        ? Theme.of(context).primaryColor
                        : Theme.of(context).disabledColor,
                  ),
                ),
              ],
            ),
            SizedBox(
              height: 30,
            ),
            Expanded(
              child: PageView(
                controller: _pageController,
                onPageChanged: (value) {
                  _pageController.jumpToPage(value);
                  pageNumber = value;
                  setState(() {});
                },
                children: [
                  com1(),
                  com2(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget com1() {
    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              com(ConstanceData.n9, ConstanceData.h20, "International Concert",
                  "Sun, Dec 23 • 19.00 - 23.00 PM", "Grand Park, New York"),
              SizedBox(
                height: 10,
              ),
              com(ConstanceData.n10, ConstanceData.h13, "Jazz Music Festival",
                  "Tue, Dec 16 • 18.00 - 22.00 PM", "New Avenue, Washing..."),
              SizedBox(
                height: 10,
              ),
              com(ConstanceData.n11, ConstanceData.h20, "DJ Music Competition",
                  "Thu, Dec 20 • 17.00 - 22.00 PM", "Central Hall, California"),
              SizedBox(
                height: 10,
              ),
              com(ConstanceData.n12, ConstanceData.h13, "National Music Fest",
                  "Wed, Dec 18 • 18.00 - 22.00 PM", "Central Park, Chicago"),
              SizedBox(
                height: 20,
              ),
              SizedBox(
                height: 35,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget com2() {
    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              SizedBox(
                height: 20,
              ),
              Row(
                children: [
                  sam(
                      ConstanceData.n9,
                      ConstanceData.h20,
                      "International Co...",
                      "Sun, Dec 23 • 19.00 - 23.00...",
                      "Grand Park, New..."),
                  SizedBox(
                    width: 5,
                  ),
                  sam(
                      ConstanceData.n10,
                      ConstanceData.h13,
                      "Jazz Music Festi...",
                      "Tue, Dec 16 • 18.00 - 22.00...",
                      "New Avenue, Wa..."),
                ],
              ),
              SizedBox(
                height: 10,
              ),
              Row(
                children: [
                  sam(
                      ConstanceData.n11,
                      ConstanceData.h20,
                      "DJ Music Compe...",
                      "Thu, Dec 20 • 17.00 - 22.00...",
                      "Central Hall, Cali..."),
                  SizedBox(
                    width: 5,
                  ),
                  sam(
                      ConstanceData.n12,
                      ConstanceData.h13,
                      "National Music F...",
                      "Wed, Dec 18 • 18.00 - 22.00...",
                      "Central Park, Ch..."),
                ],
              ),
              SizedBox(
                height: 10,
              ),
              Row(
                children: [
                  sam(
                      ConstanceData.n13,
                      ConstanceData.h13,
                      "DJ Music & Conc...",
                      "Thu, Dec 21 • 09.00 - 12.00...",
                      "Health Center, W..."),
                  SizedBox(
                    width: 5,
                  ),
                  sam(
                      ConstanceData.n14,
                      ConstanceData.h20,
                      "DJ Music & Conc...",
                      "Mon, Dec 16 • 18.00 - 22.00...",
                      "Grand Building, ..."),
                ],
              ),
              SizedBox(
                height: 20,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget com(String img, String img2, String tex1, String tex2, String tex3) {
    return Padding(
      padding: const EdgeInsets.all(5),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => EventDetailsFullPage(),
            ),
          );
        },
        child: Container(
          height: 130,
          width: double.infinity,
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.all(
              Radius.circular(20),
            ),
            boxShadow: [
              BoxShadow(
                color: AppTheme.isLightTheme
                    ? Color.fromARGB(66, 181, 178, 178)
                    : Colors.transparent,
                offset: const Offset(
                  1,
                  1,
                ),
                blurRadius: 10.0,
                spreadRadius: 2.0,
              ), //BoxShadow
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Image.asset(
                  img,
                  height: 100,
                ),
                SizedBox(
                  width: 10,
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tex1,
                      style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    SizedBox(
                      height: 15,
                    ),
                    Text(
                      tex2,
                      style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                            fontSize: 10,
                            color: Theme.of(context).primaryColor,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    SizedBox(
                      height: 15,
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Image.asset(
                          ConstanceData.h12,
                          height: 20,
                        ),
                        SizedBox(
                          width: 10,
                        ),
                        Text(
                          tex3,
                          style:
                              Theme.of(context).textTheme.bodyLarge!.copyWith(
                                    fontSize: 10,
                                    color: Theme.of(context).disabledColor,
                                    fontWeight: FontWeight.bold,
                                  ),
                        ),
                        SizedBox(
                          width: 10,
                        ),
                        Image.asset(
                          img2,
                          height: 20,
                        ),
                      ],
                    )
                  ],
                )
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget sam(String img, String img2, String tex, String tex2, String tex3) {
    return Expanded(
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => EventDetailsFullPage(),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(5),
          child: Container(
            height: 270,
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: BorderRadius.all(
                Radius.circular(20),
              ),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.isLightTheme
                      ? Color.fromARGB(66, 181, 178, 178)
                      : Colors.transparent,
                  offset: const Offset(
                    1,
                    1,
                  ),
                  blurRadius: 10.0,
                  spreadRadius: 2.0,
                ), //BoxShadow
              ],
            ),
            child: Padding(
              padding: EdgeInsets.only(
                left: 8,
                right: 8,
                top: 10,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Image.asset(
                    img,
                  ),
                  SizedBox(
                    height: 10,
                  ),
                  Text(
                    tex,
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  SizedBox(
                    height: 10,
                  ),
                  Text(
                    tex2,
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                          fontSize: 8,
                          color: Theme.of(context).primaryColor,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  SizedBox(
                    height: 10,
                  ),
                  Row(
                    children: [
                      Image.asset(
                        ConstanceData.h12,
                        height: 15,
                      ),
                      SizedBox(
                        width: 5,
                      ),
                      Text(
                        tex3,
                        style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                              fontSize: 10,
                              color: Theme.of(context).disabledColor,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      Spacer(),
                      Image.asset(
                        img2,
                        height: 20,
                      ),
                    ],
                  )
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
