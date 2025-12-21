// ignore_for_file: prefer_const_constructors, unused_element, prefer_const_constructors_in_immutables, prefer_const_literals_to_create_immutables, sort_child_properties_last, unused_import, deprecated_member_use, duplicate_ignore, sized_box_for_whitespace, annotate_overrides, use_key_in_widget_constructors, unnecessary_new

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:eveno/Widget/textFiealds.dart';
import 'package:eveno/home/31_notification.dart';
import 'package:eveno/home/32_popular_event.dart';
import 'package:eveno/home/35_search_results_list.dart';
import 'package:eveno/home/38_event_details_full_page.dart';
import 'package:flutter/material.dart';

class HomeScreen1 extends StatefulWidget {
  final AnimationController animationController;

  const HomeScreen1({super.key, required this.animationController});

  @override
  State<HomeScreen1> createState() => _HomeScreen1State();
}

class _HomeScreen1State extends State<HomeScreen1>
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
                          ConstanceData.h6,
                          height: 50,
                        ),
                        SizedBox(
                          width: 10,
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Good Morning 👋",
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyLarge!
                                  .copyWith(
                                    fontSize: 12,
                                    color: Theme.of(context).disabledColor,
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                            SizedBox(
                              height: 5,
                            ),
                            Text(
                              "Andrew Ainsley",
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyLarge!
                                  .copyWith(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                          ],
                        ),
                        Spacer(),
                        InkWell(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => NotificationScreen(),
                              ),
                            );
                          },
                          child: Image.asset(
                            AppTheme.isLightTheme
                                ? ConstanceData.h7
                                : ConstanceData.dh7,
                            height: 40,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(
                      height: 20,
                    ),
                    MyTextFieald(
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
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => SerchResultsListScreen(),
                            ),
                          );
                        },
                      ),

                      // click: click
                    ),
                    SizedBox(
                      height: 20,
                    ),
                    Expanded(
                      child: ListView(
                        padding: EdgeInsets.zero,
                        children: [
                          Row(
                            children: [
                              Text(
                                "Featured",
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyLarge!
                                    .copyWith(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                              Spacer(),
                              Text(
                                "See All",
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyLarge!
                                    .copyWith(
                                      fontSize: 12,
                                      color: Theme.of(context).primaryColor,
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                            ],
                          ),
                          SizedBox(
                            height: 20,
                          ),
                          SizedBox(
                            height: 320,
                            child: InkWell(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => EventDetailsFullPage(),
                                  ),
                                );
                              },
                              child: ListView(
                                scrollDirection: Axis.horizontal,
                                children: [
                                  Row(
                                    children: [
                                      Padding(
                                        padding: const EdgeInsets.all(8.0),
                                        child: Container(
                                          height: 300,
                                          width: 250,
                                          decoration: BoxDecoration(
                                            color: Theme.of(context).cardColor,
                                            borderRadius: BorderRadius.all(
                                              Radius.circular(20),
                                            ),
                                            boxShadow: [
                                              BoxShadow(
                                                color: AppTheme.isLightTheme
                                                    ? Color.fromARGB(
                                                        66, 181, 178, 178)
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
                                                left: 16,
                                                right: 16,
                                                top: 10,
                                                bottom: MediaQuery.of(context)
                                                        .padding
                                                        .bottom +
                                                    16),
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Image.asset(
                                                  ConstanceData.h10,
                                                ),
                                                SizedBox(
                                                  height: 10,
                                                ),
                                                Text(
                                                  "National Music Festival",
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .bodyLarge!
                                                      .copyWith(
                                                        fontSize: 16,
                                                        fontWeight:
                                                            FontWeight.bold,
                                                      ),
                                                ),
                                                SizedBox(
                                                  height: 10,
                                                ),
                                                Text(
                                                  "Mon, Dec 24 • 18.00 - 23.00 PM",
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .bodyLarge!
                                                      .copyWith(
                                                        fontSize: 12,
                                                        color: Theme.of(context)
                                                            .primaryColor,
                                                        fontWeight:
                                                            FontWeight.bold,
                                                      ),
                                                ),
                                                SizedBox(
                                                  height: 10,
                                                ),
                                                Row(
                                                  children: [
                                                    Image.asset(
                                                      ConstanceData.h12,
                                                      height: 20,
                                                    ),
                                                    SizedBox(
                                                      width: 10,
                                                    ),
                                                    Text(
                                                      "Grand Park, New York",
                                                      style: Theme.of(context)
                                                          .textTheme
                                                          .bodyLarge!
                                                          .copyWith(
                                                            fontSize: 12,
                                                            color: Theme.of(
                                                                    context)
                                                                .disabledColor,
                                                            fontWeight:
                                                                FontWeight.bold,
                                                          ),
                                                    ),
                                                    Spacer(),
                                                    Image.asset(
                                                      ConstanceData.h13,
                                                      height: 20,
                                                    ),
                                                  ],
                                                )
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                      SizedBox(
                                        width: 10,
                                      ),
                                      Padding(
                                        padding: const EdgeInsets.all(8.0),
                                        child: Container(
                                          height: 300,
                                          width: 250,
                                          decoration: BoxDecoration(
                                            color: Theme.of(context).cardColor,
                                            borderRadius: BorderRadius.all(
                                              Radius.circular(20),
                                            ),
                                            boxShadow: [
                                              BoxShadow(
                                                color: AppTheme.isLightTheme
                                                    ? Color.fromARGB(
                                                        66, 181, 178, 178)
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
                                                left: 16,
                                                right: 16,
                                                top: 10,
                                                bottom: MediaQuery.of(context)
                                                        .padding
                                                        .bottom +
                                                    16),
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Image.asset(
                                                  ConstanceData.h11,
                                                ),
                                                SizedBox(
                                                  height: 10,
                                                ),
                                                Text(
                                                  "Music Concert",
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .bodyLarge!
                                                      .copyWith(
                                                        fontSize: 16,
                                                        fontWeight:
                                                            FontWeight.bold,
                                                      ),
                                                ),
                                                SizedBox(
                                                  height: 10,
                                                ),
                                                Text(
                                                  "Mon, Dec 24 • 18.00 - 23.00 PM",
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .bodyLarge!
                                                      .copyWith(
                                                        fontSize: 12,
                                                        color: Theme.of(context)
                                                            .primaryColor,
                                                        fontWeight:
                                                            FontWeight.bold,
                                                      ),
                                                ),
                                                SizedBox(
                                                  height: 10,
                                                ),
                                                Row(
                                                  children: [
                                                    Image.asset(
                                                      ConstanceData.h12,
                                                      height: 20,
                                                    ),
                                                    SizedBox(
                                                      width: 10,
                                                    ),
                                                    Text(
                                                      "Avenue City, New York",
                                                      style: Theme.of(context)
                                                          .textTheme
                                                          .bodyLarge!
                                                          .copyWith(
                                                            fontSize: 12,
                                                            color: Theme.of(
                                                                    context)
                                                                .disabledColor,
                                                            fontWeight:
                                                                FontWeight.bold,
                                                          ),
                                                    ),
                                                    Spacer(),
                                                    Image.asset(
                                                      ConstanceData.h13,
                                                      height: 20,
                                                    ),
                                                  ],
                                                )
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                          SizedBox(
                            height: 20,
                          ),
                          Row(
                            children: [
                              Text(
                                "Popular Event 🔥",
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyLarge!
                                    .copyWith(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                              Spacer(),
                              InkWell(
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => PopularEventScreen(),
                                    ),
                                  );
                                },
                                child: Text(
                                  "See All",
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyLarge!
                                      .copyWith(
                                        fontSize: 12,
                                        color: Theme.of(context).primaryColor,
                                        fontWeight: FontWeight.bold,
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
                                      height: 40,
                                      width: 60,
                                      decoration: BoxDecoration(
                                        color: Theme.of(context).primaryColor,
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
                                      height: 40,
                                      width: 100,
                                      decoration: BoxDecoration(
                                        border: Border.all(
                                            color:
                                                Theme.of(context).primaryColor,
                                            width: 2),
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
                                                fontSize: 12,
                                                color: Theme.of(context)
                                                    .primaryColor,
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
                                      width: 80,
                                      decoration: BoxDecoration(
                                        border: Border.all(
                                            color:
                                                Theme.of(context).primaryColor,
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
                                                fontSize: 12,
                                                fontWeight: FontWeight.bold,
                                                color: Theme.of(context)
                                                    .primaryColor,
                                              ),
                                        ),
                                      ),
                                    ),
                                    SizedBox(
                                      width: 10,
                                    ),
                                    Container(
                                      height: 40,
                                      width: 120,
                                      decoration: BoxDecoration(
                                        border: Border.all(
                                            color:
                                                Theme.of(context).primaryColor,
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
                                                fontSize: 12,
                                                color: Theme.of(context)
                                                    .primaryColor,
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
                              com(
                                  ConstanceData.h14,
                                  ConstanceData.h13,
                                  "Art Workshops",
                                  "Fri, Dec 20 • 13.00 - 15.00...",
                                  "New Avenue, Wa..."),
                              SizedBox(
                                width: 5,
                              ),
                              com(
                                  ConstanceData.h15,
                                  ConstanceData.h20,
                                  "Music Concert",
                                  "Tue, Dec 19 • 19.00 - 22.00...",
                                  "Central Park, Ne..."),
                            ],
                          ),
                          SizedBox(
                            height: 10,
                          ),
                          Row(
                            children: [
                              com(
                                  ConstanceData.h16,
                                  ConstanceData.h20,
                                  "Tech Seminar",
                                  "Sat, Dec 22 • 10.00 - 12.00...",
                                  "Auditorium Build..."),
                              SizedBox(
                                width: 5,
                              ),
                              com(
                                  ConstanceData.h17,
                                  ConstanceData.h13,
                                  "Mural Painting",
                                  "Sun, Dec 16 • 11.00 - 13.00...",
                                  "City Space, New..."),
                            ],
                          ),
                          SizedBox(
                            height: 10,
                          ),
                          Row(
                            children: [
                              com(
                                  ConstanceData.h18,
                                  ConstanceData.h13,
                                  "Fitness & Gym Tr...",
                                  "Thu, Dec 21 • 09.00 - 12.00...",
                                  "Health Center, W..."),
                              SizedBox(
                                width: 5,
                              ),
                              com(
                                  ConstanceData.h19,
                                  ConstanceData.h20,
                                  "DJ Music & Conc...",
                                  "Mon, Dec 16 • 18.00 - 22.00...",
                                  "Grand Building, ..."),
                            ],
                          ),
                          SizedBox(
                            height: 20,
                          ),
                          Row(
                            children: [
                              com(
                                  ConstanceData.h21,
                                  ConstanceData.h13,
                                  "Jazz Festival",
                                  "Sun, Dec 24 • 19.00 - 23.00...",
                                  "Central Park, N..."),
                              SizedBox(
                                width: 5,
                              ),
                              com(
                                  ConstanceData.h22,
                                  ConstanceData.h13,
                                  "Music Concert",
                                  "Sat, Dec 22 • 18.00 - 22.00...",
                                  "New Avenue, W..."),
                            ],
                          ),
                          SizedBox(
                            height: 20,
                          ),
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

  Widget com(String img, String img2, String tex, String tex2, String tex3) {
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
            height: 230,
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
