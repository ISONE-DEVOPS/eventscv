// ignore_for_file: prefer_const_constructors_in_immutables, prefer_const_constructors, deprecated_member_use, file_names

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:eveno/home/35_search_results_list.dart';
import 'package:eveno/home/38_event_details_full_page.dart';
import 'package:flutter/material.dart';

class PopularEventScreen extends StatefulWidget {
  PopularEventScreen({Key? key}) : super(key: key);

  @override
  State<PopularEventScreen> createState() => _PopularEventScreenState();
}

class _PopularEventScreenState extends State<PopularEventScreen> {
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
                  "Popular Event 🔥",
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
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
                        builder: (_) => SerchResultsListScreen(),
                      ),
                    );
                  },
                  child: Image.asset(
                    AppTheme.isLightTheme
                        ? ConstanceData.n6
                        : ConstanceData.dn1,
                    height: 25,
                  ),
                ),
              ],
            ),
            SizedBox(
              height: 20,
            ),
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
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
                              height: 40,
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
                              height: 40,
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
                                        color: Theme.of(context).primaryColor,
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
                    height: 20,
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
                    height: 20,
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
                      com(ConstanceData.h22, ConstanceData.h13, "Music Concert",
                          "Sat, Dec 22 • 18.00 - 22.00...", "New Avenue, W..."),
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
            height: 240,
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
