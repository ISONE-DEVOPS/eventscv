// ignore_for_file: prefer_const_constructors, unused_element, prefer_const_constructors_in_immutables, prefer_const_literals_to_create_immutables, sort_child_properties_last, unused_import, deprecated_member_use, duplicate_ignore, sized_box_for_whitespace, annotate_overrides, use_key_in_widget_constructors, unnecessary_new, unused_local_variable, file_names

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:eveno/Widget/textFiealds.dart';
import 'package:flutter/material.dart';

class FavoritesCardsScreen extends StatefulWidget {
  final AnimationController animationController;

  const FavoritesCardsScreen({super.key, required this.animationController});

  @override
  State<FavoritesCardsScreen> createState() => _FavoritesCardsScreenState();
}

class _FavoritesCardsScreenState extends State<FavoritesCardsScreen>
    with TickerProviderStateMixin {
  int pageNumber = 0;
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
        // ignore: no_leading_underscores_for_local_identifiers
        final PageController _pageController = PageController();
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
                            "Favorites",
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
                                    borderRadius:
                                        BorderRadius.all(Radius.circular(20)),
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
                                        color: Theme.of(context).primaryColor,
                                        width: 2),
                                    borderRadius:
                                        BorderRadius.all(Radius.circular(20)),
                                  ),
                                  child: Center(
                                    child: Text(
                                      "🎵 Music",
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyLarge!
                                          .copyWith(
                                            fontSize: 12,
                                            color:
                                                Theme.of(context).primaryColor,
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
                                        color: Theme.of(context).primaryColor,
                                        width: 2),
                                    borderRadius:
                                        BorderRadius.all(Radius.circular(20)),
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
                                            color:
                                                Theme.of(context).primaryColor,
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
                                        color: Theme.of(context).primaryColor,
                                        width: 2),
                                    borderRadius:
                                        BorderRadius.all(Radius.circular(20)),
                                  ),
                                  child: Center(
                                    child: Text(
                                      "💼 Workshops",
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyLarge!
                                          .copyWith(
                                            fontSize: 12,
                                            color:
                                                Theme.of(context).primaryColor,
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
                        height: 16,
                      ),
                      Row(
                        children: [
                          Text(
                            "44 favorites",
                            style:
                                Theme.of(context).textTheme.bodyLarge!.copyWith(
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
                        height: 16,
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
              )),
        );
      },
    );
  }

  Widget com1() {
    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: EdgeInsets.only(left: 8, right: 8, top: 8),
            children: [
              InkWell(
                onTap: () {},
                child: com(
                    ConstanceData.f3,
                    ConstanceData.h20,
                    "Mural Art Festival",
                    "Wed, Dec 18 • 18.00 - 22.00 PM",
                    "Central Park, Chicago"),
              ),
              SizedBox(
                height: 20,
              ),
              com(ConstanceData.f4, ConstanceData.h20, "Speech Competition",
                  "Thu, Dec 20 • 17.00 - 22.00 PM", "Central Hall, California"),
              SizedBox(
                height: 20,
              ),
              com(ConstanceData.f5, ConstanceData.h20, "Startup Workshops",
                  "Sun, Dec 23 • 19.00 - 23.00 PM", "Grand Park, New York"),
              SizedBox(
                height: 20,
              ),
              com(ConstanceData.f6, ConstanceData.h20, "Dance & Music Fest",
                  "Tue, Dec 16 • 18.00 - 22.00 PM", "New Avenue, Washing..."),
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
    return InkWell(
      child: Column(
        children: [
          Expanded(
            child: ListView(
              padding: EdgeInsets.only(left: 8, right: 8),
              children: [
                SizedBox(
                  height: 20,
                ),
                Row(
                  children: [
                    sam(
                        ConstanceData.f3,
                        ConstanceData.h20,
                        "Mural Art Festival",
                        "Wed, Dec 18 • 18.00 - 22.00...",
                        "Central Park, Ch..."),
                    SizedBox(
                      width: 20,
                    ),
                    sam(
                        ConstanceData.f4,
                        ConstanceData.h20,
                        "Speech Competi...",
                        "Thu, Dec 20 • 17.00 - 22.00...",
                        "Central Hall, Cali..."),
                  ],
                ),
                SizedBox(
                  height: 20,
                ),
                Row(
                  children: [
                    sam(
                        ConstanceData.f5,
                        ConstanceData.h20,
                        "Startup Worksh...",
                        "Sun, Dec 23 • 19.00 - 23.00...",
                        "Grand Park, New..."),
                    SizedBox(
                      width: 20,
                    ),
                    sam(
                        ConstanceData.f6,
                        ConstanceData.h20,
                        "Dance & Music F...",
                        "Tue, Dec 16 • 18.00 - 22.00...",
                        "New Avenue, Wa..."),
                  ],
                ),
                SizedBox(
                  height: 20,
                ),
                Row(
                  children: [
                    sam(
                        ConstanceData.f7,
                        ConstanceData.h20,
                        "DJ Music & Conc...",
                        "Thu, Dec 21 • 09.00 - 12.00...",
                        "Health Center, W..."),
                    SizedBox(
                      width: 20,
                    ),
                    sam(
                        ConstanceData.f8,
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
      ),
    );
  }

  Widget com(String img, String img2, String tex1, String tex2, String tex3) {
    return InkWell(
      onTap: () {
        showModalBottomSheet<void>(
          backgroundColor: AppTheme.isLightTheme ? Colors.white : Colors.black,
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
                            color: Theme.of(context).dividerColor,
                            borderRadius: BorderRadius.all(Radius.circular(20)),
                          ),
                        ),
                        SizedBox(
                          height: 20,
                        ),
                        Text(
                          "Remove from Favorites?",
                          style: Theme.of(context)
                              .textTheme
                              .bodyLarge!
                              .copyWith(
                                  fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        SizedBox(
                          height: 20,
                        ),
                        Divider(),
                        SizedBox(
                          height: 20,
                        ),
                        Container(
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
                                  ConstanceData.f3,
                                  height: 100,
                                ),
                                SizedBox(
                                  width: 10,
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      "Mural Art Festival",
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyLarge!
                                          .copyWith(
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                          ),
                                    ),
                                    SizedBox(
                                      height: 15,
                                    ),
                                    Text(
                                      "Wed, Dec 18 • 18.00 - 22.00 PM",
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyLarge!
                                          .copyWith(
                                            fontSize: 10,
                                            color:
                                                Theme.of(context).primaryColor,
                                            fontWeight: FontWeight.bold,
                                          ),
                                    ),
                                    SizedBox(
                                      height: 15,
                                    ),
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Image.asset(
                                          ConstanceData.h12,
                                          height: 20,
                                        ),
                                        SizedBox(
                                          width: 10,
                                        ),
                                        Text(
                                          "Central Park, Chicago",
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodyLarge!
                                              .copyWith(
                                                fontSize: 10,
                                                color: Theme.of(context)
                                                    .disabledColor,
                                                fontWeight: FontWeight.bold,
                                              ),
                                        ),
                                      ],
                                    ),
                                  ],
                                )
                              ],
                            ),
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
                                      BorderRadius.all(Radius.circular(25)),
                                ),
                                child: Center(
                                  child: Text(
                                    "Reset",
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyLarge!
                                        .copyWith(
                                          fontSize: 14,
                                          color: AppTheme.isLightTheme
                                              ? Theme.of(context).primaryColor
                                              : Colors.white,
                                          fontWeight: FontWeight.bold,
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
                                  decoration: BoxDecoration(
                                    color: Theme.of(context).primaryColor,
                                    borderRadius:
                                        BorderRadius.all(Radius.circular(25)),
                                  ),
                                  child: Center(
                                    child: Text(
                                      "Apply",
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyLarge!
                                          .copyWith(
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white,
                                          ),
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
                  decoration: BoxDecoration(
                    color: AppTheme.isLightTheme
                        ? Colors.white
                        : HexColor("#1F222A"),
                    border: Border.all(color: HexColor("#EBEBF0")),
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
    );
  }

  Widget sam(String img, String img2, String tex, String tex2, String tex3) {
    return Expanded(
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
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}
