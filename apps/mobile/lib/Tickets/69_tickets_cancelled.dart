// ignore_for_file: prefer_const_constructors, unused_element, prefer_const_constructors_in_immutables, prefer_const_literals_to_create_immutables, sort_child_properties_last, unused_import, deprecated_member_use, duplicate_ignore, sized_box_for_whitespace, annotate_overrides, use_key_in_widget_constructors, unnecessary_new, unused_local_variable, no_leading_underscores_for_local_identifiers, file_names

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:eveno/Tickets/76_cancel_booking_select_reason.dart';
import 'package:eveno/Widget/buttons.dart';
import 'package:eveno/Widget/textFiealds.dart';
import 'package:flutter/material.dart';

class TicketsScreen extends StatefulWidget {
  final AnimationController animationController;

  const TicketsScreen({super.key, required this.animationController});

  @override
  State<TicketsScreen> createState() => _TicketsScreenState();
}

class _TicketsScreenState extends State<TicketsScreen>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late ScrollController controller;
  bool isLoadingSliderDetail = false;
  var sliderImageHieght = 0.0;

  final PageController _pageController = PageController();
  int pageNumber = 0;

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
                      left: 10,
                      right: 10,
                      top: MediaQuery.of(context).padding.top + 20,
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
                            "Tickets",
                            style: Theme.of(context)
                                .textTheme
                                .bodyLarge!
                                .copyWith(
                                    fontSize: 20, fontWeight: FontWeight.bold),
                          ),
                          Spacer(),
                          Image.asset(
                            AppTheme.isLightTheme
                                ? ConstanceData.f1
                                : ConstanceData.df1,
                            height: 25,
                          ),
                          SizedBox(
                            width: 20,
                          ),
                          Image.asset(
                            AppTheme.isLightTheme
                                ? ConstanceData.f2
                                : ConstanceData.df2,
                            height: 25,
                          ),
                        ],
                      ),
                      SizedBox(
                        height: 20,
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
                              "Upcoming",
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyLarge!
                                  .copyWith(
                                      fontSize: 14,
                                      color: pageNumber == 0
                                          ? Theme.of(context).primaryColor
                                          : Theme.of(context).disabledColor,
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
                              "Completed",
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyLarge!
                                  .copyWith(
                                      fontSize: 14,
                                      color: pageNumber == 1
                                          ? Theme.of(context).primaryColor
                                          : Theme.of(context).disabledColor,
                                      fontWeight: FontWeight.bold),
                            ),
                          ),
                          InkWell(
                            onTap: () {
                              setState(() {
                                _pageController.jumpToPage(2);
                              });
                            },
                            child: Text(
                              "Cancelled",
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyLarge!
                                  .copyWith(
                                      fontSize: 14,
                                      color: pageNumber == 2
                                          ? Theme.of(context).primaryColor
                                          : Theme.of(context).disabledColor,
                                      fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(
                        height: 20,
                      ),
                      Expanded(
                        flex: 4,
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
                              padding: EdgeInsets.zero,
                              children: [
                                Divider(),
                                SizedBox(
                                  height: 20,
                                ),
                                com3(
                                    ConstanceData.t8,
                                    "National Music Festi...",
                                    "Mon, Dec 24 • 18.00 - 23.00 PM",
                                    "Grand Park, New "),
                                SizedBox(
                                  height: 10,
                                ),
                                com3(
                                    ConstanceData.t9,
                                    "Art & Mural Worksh...",
                                    "Wed, Dec 27 • 14.00 - 16.00 PM",
                                    "Central Art, Was..."),
                                SizedBox(
                                  height: 20,
                                ),
                              ],
                            ),
                            // *******************
                            ListView(
                              padding: EdgeInsets.zero,
                              children: [
                                Divider(),
                                SizedBox(
                                  height: 20,
                                ),
                                com2(
                                    ConstanceData.t5,
                                    "Art & Painting Train...",
                                    "Wed, Dec 26 • 18.00 - 21.00 PM",
                                    "Central Art, ..."),
                                SizedBox(
                                  height: 10,
                                ),
                                com2(
                                    ConstanceData.t6,
                                    "DJ & Music Concert",
                                    "Tue, Dec 30 • 18.00 - 22.00 PM",
                                    "New Avenue, ..."),
                                SizedBox(
                                  height: 10,
                                ),
                                com2(
                                    ConstanceData.t7,
                                    "Fitness & Gym Train...",
                                    "Sun, Dec 24 • 19.00 - 23.00 PM",
                                    "Grand Build, ..."),
                                SizedBox(
                                  height: 20,
                                ),
                              ],
                            ),
                            // ***********************
                            ListView(
                              padding: EdgeInsets.zero,
                              children: [
                                Divider(),
                                SizedBox(
                                  height: 20,
                                ),
                                com(
                                    ConstanceData.t1,
                                    "Traditional Dance Fe...",
                                    "Tue, Dec 16 • 18.00 - 22.00 PM",
                                    "New Avenue, ..."),
                                SizedBox(
                                  height: 10,
                                ),
                                com(
                                    ConstanceData.t2,
                                    "Painting Workshops",
                                    "Sun, Dec 23 • 19.00 - 23.00 PM",
                                    "Grand Park, ..."),
                                SizedBox(
                                  height: 10,
                                ),
                                com(
                                    ConstanceData.t3,
                                    "Gebyar Music Festiv...",
                                    "Thu, Dec 20 • 17.00 - 22.00 PM",
                                    "Central Hall, ..."),
                                SizedBox(
                                  height: 10,
                                ),
                                com(
                                    ConstanceData.t4,
                                    "Traditional Dance Fe...",
                                    "Tue, Dec 16 • 18.00 - 22.00 PM",
                                    "Grand Park, ..."),
                                SizedBox(
                                  height: 10,
                                ),
                                com(
                                    ConstanceData.t4,
                                    "National Concert of ...",
                                    "Wed, Dec 18 • 18.00 - 22.00 PM",
                                    "Central Park, ..."),
                                SizedBox(
                                  height: 20,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              )),
        );
      },
    );
  }

  Widget com(String img, String tex1, String tex2, String tex3) {
    return Padding(
      padding: const EdgeInsets.all(5),
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
                        style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                              fontSize: 10,
                              color: Theme.of(context).disabledColor,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      SizedBox(
                        width: 10,
                      ),
                      InkWell(
                        onTap: () {
                          showModalBottomSheet<void>(
                            context: context,
                            builder: (BuildContext context) {
                              return ListView(
                                children: [
                                  Container(
                                    height: 500,
                                    child: Padding(
                                      padding: const EdgeInsets.all(8.0),
                                      child: Column(
                                        children: [
                                          Container(
                                            height: 3,
                                            width: 30,
                                            decoration: BoxDecoration(
                                              color: Theme.of(context)
                                                  .dividerColor,
                                              borderRadius: BorderRadius.all(
                                                  Radius.circular(20)),
                                            ),
                                          ),
                                          SizedBox(
                                            height: 20,
                                          ),
                                          Text(
                                            "Cancel Booking",
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyLarge!
                                                .copyWith(
                                                    fontSize: 18,
                                                    fontWeight:
                                                        FontWeight.bold),
                                          ),
                                          SizedBox(
                                            height: 20,
                                          ),
                                          Divider(),
                                          SizedBox(
                                            height: 20,
                                          ),
                                          Text(
                                            "Are you sure you want to cancel this event?",
                                            textAlign: TextAlign.center,
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyLarge!
                                                .copyWith(
                                                    fontSize: 16,
                                                    fontWeight:
                                                        FontWeight.bold),
                                          ),
                                          SizedBox(
                                            height: 30,
                                          ),
                                          Text(
                                            "Only 80% of funds will be returned to your account according to our policy.",
                                            textAlign: TextAlign.center,
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyLarge!
                                                .copyWith(
                                                  fontSize: 14,
                                                ),
                                          ),
                                          SizedBox(
                                            height: 30,
                                          ),
                                          Row(
                                            children: [
                                              Expanded(
                                                child: Container(
                                                  height: 50,
                                                  decoration: BoxDecoration(
                                                    color: AppTheme.isLightTheme
                                                        ? HexColor("#EEEDFE")
                                                        : HexColor("#35383F"),
                                                    borderRadius:
                                                        BorderRadius.all(
                                                            Radius.circular(
                                                                28)),
                                                  ),
                                                  child: Center(
                                                    child: Text(
                                                      "Maybe Later",
                                                      style: Theme.of(context)
                                                          .textTheme
                                                          .bodyLarge!
                                                          .copyWith(
                                                            fontSize: 12,
                                                            color: AppTheme
                                                                    .isLightTheme
                                                                ? Theme.of(
                                                                        context)
                                                                    .primaryColor
                                                                : Colors.white,
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
                                                child: MyButton(
                                                    btnName: "Submit",
                                                    click: () {
                                                      Navigator.push(
                                                        context,
                                                        MaterialPageRoute(
                                                          builder: (_) =>
                                                              CencleBookingSelectReason(),
                                                        ),
                                                      );
                                                    }),
                                              )
                                            ],
                                          ),
                                          SizedBox(
                                            height: 20,
                                          ),
                                        ],
                                      ),
                                    ),
                                    decoration: BoxDecoration(
                                      color: AppTheme.isLightTheme
                                          ? Colors.white
                                          : HexColor("#1F222A"),
                                      border: Border.all(
                                          color: HexColor("#EBEBF0")),
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
                        child: Container(
                            height: 30,
                            width: 80,
                            decoration: BoxDecoration(
                              border: Border.all(
                                color: HexColor("#F75555"),
                              ),
                              borderRadius:
                                  BorderRadius.all(Radius.circular(8)),
                            ),
                            child: Center(
                              child: Text(
                                "Cancelled",
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyLarge!
                                    .copyWith(
                                      fontSize: 10,
                                      color: HexColor("#F75555"),
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                            )),
                      ),
                    ],
                  )
                ],
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget com2(String img, String tex1, String tex2, String tex3) {
    return Padding(
      padding: const EdgeInsets.all(5),
      child: Container(
        height: 180,
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
          child: Column(
            children: [
              Row(
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
                          Container(
                              height: 30,
                              width: 80,
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color: HexColor("#07BD74"),
                                ),
                                borderRadius:
                                    BorderRadius.all(Radius.circular(8)),
                              ),
                              child: Center(
                                child: Text(
                                  "Completed",
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyLarge!
                                      .copyWith(
                                        fontSize: 10,
                                        color: HexColor("#07BD74"),
                                        fontWeight: FontWeight.bold,
                                      ),
                                ),
                              )),
                        ],
                      ),
                    ],
                  )
                ],
              ),
              SizedBox(
                height: 5,
              ),
              Divider(),
              SizedBox(
                height: 5,
              ),
              Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () {
                        showModalBottomSheet<void>(
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
                                          "Leave a Review",
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodyLarge!
                                              .copyWith(
                                                  fontSize: 18,
                                                  fontWeight: FontWeight.bold),
                                        ),
                                        SizedBox(
                                          height: 20,
                                        ),
                                        Divider(),
                                        SizedBox(
                                          height: 20,
                                        ),
                                        Text(
                                          "How was your experience with Art & Painting Training?",
                                          textAlign: TextAlign.center,
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodyLarge!
                                              .copyWith(
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.bold),
                                        ),
                                        SizedBox(
                                          height: 30,
                                        ),
                                        Image.asset(ConstanceData.t10),
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
                                              "Write Your Review",
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodyLarge!
                                                  .copyWith(
                                                      fontSize: 16,
                                                      fontWeight:
                                                          FontWeight.bold),
                                            ),
                                          ],
                                        ),
                                        SizedBox(
                                          height: 20,
                                        ),
                                        Container(
                                          height: 130,
                                          width: double.infinity,
                                          decoration: BoxDecoration(
                                            color: AppTheme.isLightTheme
                                                ? HexColor("#FAFAFA")
                                                : HexColor("#35383F"),
                                            borderRadius: BorderRadius.all(
                                                Radius.circular(28)),
                                          ),
                                          child: Padding(
                                            padding: const EdgeInsets.all(20),
                                            child: Text(
                                              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.",
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodyLarge!
                                                  .copyWith(
                                                    fontSize: 12,
                                                  ),
                                            ),
                                          ),
                                        ),
                                        SizedBox(
                                          height: 20,
                                        ),
                                        Row(
                                          children: [
                                            Expanded(
                                              child: Container(
                                                height: 50,
                                                decoration: BoxDecoration(
                                                  color: AppTheme.isLightTheme
                                                      ? HexColor("#EEEDFE")
                                                      : HexColor("#35383F"),
                                                  borderRadius:
                                                      BorderRadius.all(
                                                          Radius.circular(28)),
                                                ),
                                                child: Center(
                                                  child: Text(
                                                    "Maybe Later",
                                                    style: Theme.of(context)
                                                        .textTheme
                                                        .bodyLarge!
                                                        .copyWith(
                                                          fontSize: 12,
                                                          color: AppTheme
                                                                  .isLightTheme
                                                              ? Theme.of(
                                                                      context)
                                                                  .primaryColor
                                                              : Colors.white,
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
                                              child: MyButton(
                                                  btnName: "Submit",
                                                  click: () {
                                                    Navigator.pop(context);
                                                  }),
                                            )
                                          ],
                                        ),
                                        SizedBox(
                                          height: 20,
                                        ),
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
                      child: Container(
                        height: 30,
                        decoration: BoxDecoration(
                          border: Border.all(
                              color: Theme.of(context).primaryColor, width: 2),
                          borderRadius: BorderRadius.all(Radius.circular(20)),
                        ),
                        child: Center(
                          child: Text(
                            "Leave a Review",
                            style:
                                Theme.of(context).textTheme.bodyLarge!.copyWith(
                                      fontSize: 10,
                                      color: Theme.of(context).primaryColor,
                                      fontWeight: FontWeight.bold,
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
                    child: Container(
                      height: 30,
                      decoration: BoxDecoration(
                        color: Theme.of(context).primaryColor,
                        borderRadius: BorderRadius.all(Radius.circular(20)),
                      ),
                      child: Center(
                        child: Text(
                          "View E-Ticket",
                          style:
                              Theme.of(context).textTheme.bodyLarge!.copyWith(
                                    fontSize: 10,
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
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
    );
  }

  Widget com3(String img, String tex1, String tex2, String tex3) {
    return Padding(
      padding: const EdgeInsets.all(5),
      child: Container(
        height: 180,
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
          child: Column(
            children: [
              Row(
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
                            width: 15,
                          ),
                          Container(
                              height: 30,
                              width: 60,
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color: Theme.of(context).primaryColor,
                                ),
                                borderRadius:
                                    BorderRadius.all(Radius.circular(8)),
                              ),
                              child: Center(
                                child: Text(
                                  "Paid",
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyLarge!
                                      .copyWith(
                                        fontSize: 10,
                                        color: Theme.of(context).primaryColor,
                                        fontWeight: FontWeight.bold,
                                      ),
                                ),
                              )),
                        ],
                      ),
                    ],
                  )
                ],
              ),
              SizedBox(
                height: 5,
              ),
              Divider(),
              SizedBox(
                height: 5,
              ),
              Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () {
                        showModalBottomSheet<void>(
                          context: context,
                          builder: (BuildContext context) {
                            return ListView(
                              children: [
                                Container(
                                  height: 500,
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
                                          "Cancel Booking",
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodyLarge!
                                              .copyWith(
                                                  fontSize: 18,
                                                  fontWeight: FontWeight.bold),
                                        ),
                                        SizedBox(
                                          height: 20,
                                        ),
                                        Divider(),
                                        SizedBox(
                                          height: 20,
                                        ),
                                        Text(
                                          "Are you sure you want to cancel this event?",
                                          textAlign: TextAlign.center,
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodyLarge!
                                              .copyWith(
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.bold),
                                        ),
                                        SizedBox(
                                          height: 30,
                                        ),
                                        Text(
                                          "Only 80% of funds will be returned to your account according to our policy.",
                                          textAlign: TextAlign.center,
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodyLarge!
                                              .copyWith(
                                                fontSize: 14,
                                              ),
                                        ),
                                        SizedBox(
                                          height: 30,
                                        ),
                                        Row(
                                          children: [
                                            Expanded(
                                              child: Container(
                                                height: 50,
                                                decoration: BoxDecoration(
                                                  color: AppTheme.isLightTheme
                                                      ? HexColor("#EEEDFE")
                                                      : HexColor("#35383F"),
                                                  borderRadius:
                                                      BorderRadius.all(
                                                          Radius.circular(28)),
                                                ),
                                                child: Center(
                                                  child: Text(
                                                    "Maybe Later",
                                                    style: Theme.of(context)
                                                        .textTheme
                                                        .bodyLarge!
                                                        .copyWith(
                                                          fontSize: 12,
                                                          color: AppTheme
                                                                  .isLightTheme
                                                              ? Theme.of(
                                                                      context)
                                                                  .primaryColor
                                                              : Colors.white,
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
                                              child: MyButton(
                                                  btnName: "Submit",
                                                  click: () {
                                                    Navigator.push(
                                                      context,
                                                      MaterialPageRoute(
                                                        builder: (_) =>
                                                            CencleBookingSelectReason(),
                                                      ),
                                                    );
                                                  }),
                                            )
                                          ],
                                        ),
                                        SizedBox(
                                          height: 20,
                                        ),
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
                      child: Container(
                        height: 30,
                        decoration: BoxDecoration(
                          border: Border.all(
                              color: Theme.of(context).primaryColor, width: 2),
                          borderRadius: BorderRadius.all(Radius.circular(20)),
                        ),
                        child: Center(
                          child: Text(
                            "Cancel Booking",
                            style:
                                Theme.of(context).textTheme.bodyLarge!.copyWith(
                                      fontSize: 10,
                                      color: Theme.of(context).primaryColor,
                                      fontWeight: FontWeight.bold,
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
                    child: Container(
                      height: 30,
                      decoration: BoxDecoration(
                        color: Theme.of(context).primaryColor,
                        borderRadius: BorderRadius.all(Radius.circular(20)),
                      ),
                      child: Center(
                        child: Text(
                          "View E-Ticket",
                          style:
                              Theme.of(context).textTheme.bodyLarge!.copyWith(
                                    fontSize: 10,
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
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
    );
  }
}
