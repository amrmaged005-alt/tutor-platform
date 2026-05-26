import '../core/models.dart';

class MockData {
  static final centers = <EducationCenter>[
    const EducationCenter(
      id: 'center-nasr-academy',
      name: 'Nasr City Learning Hub',
      city: 'Cairo',
      location: 'Makram Ebeid, Nasr City',
      subjects: ['Math', 'Physics', 'Chemistry', 'English'],
      rating: 4.8,
      tutorCount: 18,
      description:
          'A focused K-12 center for exam prep, STEM tracks, and international curricula.',
    ),
    const EducationCenter(
      id: 'center-maadi',
      name: 'Maadi Scholars Center',
      city: 'Cairo',
      location: 'Road 9, Maadi',
      subjects: ['Arabic', 'English', 'History', 'Art'],
      rating: 4.6,
      tutorCount: 12,
      description:
          'Small-group tutoring with strong Arabic and English language programs.',
    ),
    const EducationCenter(
      id: 'center-zayed',
      name: 'Zayed STEM Studio',
      city: 'Giza',
      location: 'Sheikh Zayed, District 7',
      subjects: ['Programming', 'Math', 'Science', 'Physics'],
      rating: 4.9,
      tutorCount: 15,
      description:
          'Project-based tutoring for programming, robotics, and science competitions.',
    ),
    const EducationCenter(
      id: 'center-alex',
      name: 'Alex Elite Tutors',
      city: 'Alexandria',
      location: 'Smouha, Alexandria',
      subjects: ['Biology', 'Chemistry', 'English', 'Music'],
      rating: 4.7,
      tutorCount: 11,
      description:
          'Alexandria-based center for national and international school support.',
    ),
    const EducationCenter(
      id: 'center-mansoura',
      name: 'Mansoura Exam Prep',
      city: 'Mansoura',
      location: 'Gehan Street, Mansoura',
      subjects: ['Math', 'Arabic', 'Science', 'History'],
      rating: 4.5,
      tutorCount: 9,
      description:
          'Affordable revision groups and one-to-one sessions for middle and high school.',
    ),
    const EducationCenter(
      id: 'center-tanta',
      name: 'Tanta Future Academy',
      city: 'Tanta',
      location: 'El Bahr Street, Tanta',
      subjects: ['Physics', 'Chemistry', 'Biology', 'Math'],
      rating: 4.4,
      tutorCount: 10,
      description:
          'Science-first tutoring center with weekend intensive classes.',
    ),
    const EducationCenter(
      id: 'center-tagamoa',
      name: 'New Cairo International Prep',
      city: 'Cairo',
      location: 'Fifth Settlement',
      subjects: ['IGCSE', 'English', 'Math', 'Science'],
      rating: 4.9,
      tutorCount: 21,
      description:
          'International curriculum specialists for IGCSE, American, and IB students.',
    ),
    const EducationCenter(
      id: 'center-assiut',
      name: 'Assiut Top Grades',
      city: 'Assiut',
      location: 'El Gomhoria Street',
      subjects: ['Arabic', 'Math', 'English', 'Programming'],
      rating: 4.3,
      tutorCount: 8,
      description:
          'Compact learning center for core school subjects and digital skills.',
    ),
  ];

  static final tutors = <TutorProfile>[
    _tutor('tutor-amina', 'Amina Hassan', 'Cairo', ['Math', 'IGCSE'], 4.9, 420),
    _tutor(
      'tutor-omar',
      'Omar El-Sayed',
      'Giza',
      ['Physics', 'Science'],
      4.8,
      380,
    ),
    _tutor('tutor-nour', 'Nour Adel', 'Cairo', ['English', 'Arabic'], 4.7, 300),
    _tutor('tutor-karim', 'Karim Fouad', 'Alexandria', ['Chemistry'], 4.9, 400),
    _tutor(
      'tutor-laila',
      'Laila Mahmoud',
      'Mansoura',
      ['Biology', 'Science'],
      4.6,
      280,
    ),
    _tutor(
      'tutor-youssef',
      'Youssef Samir',
      'Cairo',
      ['Programming', 'Math'],
      4.8,
      450,
    ),
    _tutor(
      'tutor-menna',
      'Menna Atef',
      'Tanta',
      ['Arabic', 'History'],
      4.5,
      240,
    ),
    _tutor(
      'tutor-hazem',
      'Hazem Nabil',
      'Cairo',
      ['Physics', 'Math'],
      4.7,
      360,
    ),
    _tutor('tutor-salma', 'Salma Gamal', 'Giza', ['Art', 'Music'], 4.9, 300),
    _tutor(
      'tutor-farida',
      'Farida Mostafa',
      'Cairo',
      ['English', 'IGCSE'],
      4.8,
      390,
    ),
    _tutor(
      'tutor-ziad',
      'Ziad Ashraf',
      'Alexandria',
      ['Programming'],
      4.6,
      350,
    ),
    _tutor(
      'tutor-hana',
      'Hana Magdy',
      'Cairo',
      ['Chemistry', 'Biology'],
      4.7,
      340,
    ),
    _tutor('tutor-adel', 'Adel Hamdy', 'Assiut', ['Math', 'Science'], 4.4, 220),
    _tutor(
      'tutor-mariam',
      'Mariam Tarek',
      'Giza',
      ['English', 'History'],
      4.6,
      260,
    ),
    _tutor(
      'tutor-seif',
      'Seif Wael',
      'Cairo',
      ['Physics', 'Programming'],
      4.8,
      410,
    ),
    _tutor(
      'tutor-dina',
      'Dina Sherif',
      'Mansoura',
      ['Arabic', 'English'],
      4.5,
      230,
    ),
  ];

  static final classes = List<AppClass>.generate(28, (index) {
    final tutor = tutors[index % tutors.length];
    final subject = tutor.subjects.first == 'IGCSE'
        ? 'Math'
        : tutor.subjects.first;
    final price = 180 + (index % 7) * 55;
    final capacity = 8 + (index % 5) * 4;
    final enrolled = index % 9 == 0 ? capacity : 2 + (index % capacity);
    final remaining = capacity - enrolled;
    return AppClass(
      id: 'class-${index + 1}',
      title:
          '$subject ${_level(index)} group with ${tutor.name.split(' ').first}',
      subject: subject,
      city: tutor.city,
      priceEgp: price,
      bookingsCount: enrolled,
      format: index.isEven ? 'IN_PERSON' : 'ONLINE',
      curriculum: index % 3 == 0 ? 'IGCSE' : 'NATIONAL',
      language: index % 4 == 0 ? 'English' : 'Arabic',
      description:
          'Compact weekly class covering school topics, exam practice, homework support, and a clear revision plan.',
      location: index.isEven
          ? centers[index % centers.length].location
          : 'Online',
      gradeLevel: 'Grade ${7 + (index % 6)}',
      schedule: '${_day(index)} ${4 + (index % 5)}:00 PM',
      capacity: capacity,
      spotsLeft: remaining,
      totalSeats: capacity,
      enrolledSeats: enrolled,
      durationMinutes: [60, 75, 90, 120][index % 4],
      level: _level(index),
      status: index % 11 == 0 ? 'DRAFT' : 'ACTIVE',
      thumbnailUrl: _thumb(index),
      paymentType: index % 3 == 0 ? 'ONLINE' : 'IN_PERSON',
      avgRating: 4.3 + (index % 7) / 10,
      reviewCount: 8 + index,
      providerName: tutor.name,
      tutors: [TutorMini(id: tutor.id, name: tutor.name, isVerified: true)],
      postClassContent: index % 6 == 0
          ? const PostClassContent(
              notesUrl: 'Session notes ready after class',
              recordingUrl: 'https://drive.google.com/example',
              homeworkUrl: 'Homework worksheet placeholder',
            )
          : null,
    );
  });

  static final reviews = <ReviewItem>[
    _review('r1', 5, 'Mona', 'Very organized and the session plan was clear.'),
    _review('r2', 4, 'Ahmed', 'Good explanation and useful exam questions.'),
    _review('r3', 5, 'Jana', 'The tutor followed up after class.'),
    _review('r4', 4, 'Yassin', 'Great value for the price.'),
  ];

  static List<AppClass> filteredClasses({
    String search = '',
    String subject = '',
    String format = '',
    String city = '',
    double maxPrice = 500,
    String sortBy = 'newest',
  }) {
    final q = search.trim().toLowerCase();
    var result = classes.where((item) {
      final matchesSearch =
          q.isEmpty ||
          item.title.toLowerCase().contains(q) ||
          item.subject.toLowerCase().contains(q) ||
          item.providerName.toLowerCase().contains(q);
      return matchesSearch &&
          (subject.isEmpty || item.subject == subject) &&
          (format.isEmpty || item.format == format) &&
          (city.isEmpty ||
              item.city == city ||
              (item.location ?? '').contains(city)) &&
          item.priceEgp <= maxPrice;
    }).toList();
    if (sortBy == 'popular') {
      result.sort((a, b) => b.bookingsCount.compareTo(a.bookingsCount));
    } else if (sortBy == 'price_asc') {
      result.sort((a, b) => a.priceEgp.compareTo(b.priceEgp));
    } else {
      result = result.reversed.toList();
    }
    return result;
  }

  static List<TutorProfile> filteredTutors({
    String search = '',
    String subject = '',
  }) {
    final q = search.trim().toLowerCase();
    return tutors.where((item) {
      final matchesSearch =
          q.isEmpty ||
          item.name.toLowerCase().contains(q) ||
          item.subjects.join(' ').toLowerCase().contains(q) ||
          item.city.toLowerCase().contains(q);
      return matchesSearch &&
          (subject.isEmpty || item.subjects.contains(subject));
    }).toList();
  }

  static TutorProfile tutorById(String id) {
    final tutor = tutors.firstWhere(
      (item) => item.id == id,
      orElse: () => tutors.first,
    );
    final owned = classes
        .where((item) => item.tutors.any((t) => t.id == tutor.id))
        .toList();
    return TutorProfile(
      id: tutor.id,
      name: tutor.name,
      city: tutor.city,
      subjects: tutor.subjects,
      classCount: owned.length,
      studentCount: owned.fold(0, (sum, item) => sum + item.bookingsCount),
      bio: tutor.bio,
      photoUrl: tutor.photoUrl,
      centerName: tutor.centerName,
      hourlyRateEgp: tutor.hourlyRateEgp,
      availableSlots: tutor.availableSlots,
      avgRating: tutor.avgRating,
      reviewCount: tutor.reviewCount,
      isVerified: tutor.isVerified,
      classes: owned,
    );
  }

  static AppClass classById(String id) =>
      classes.firstWhere((item) => item.id == id, orElse: () => classes.first);

  static TutorProfile _tutor(
    String id,
    String name,
    String city,
    List<String> subjects,
    double rating,
    int rate,
  ) {
    return TutorProfile(
      id: id,
      name: name,
      city: city,
      subjects: subjects,
      classCount: 3,
      studentCount: 48 + id.length,
      bio:
          '$name is a Coursaty tutor with practical lesson plans, parent updates, and exam-focused practice.',
      centerName: centers[id.length % centers.length].name,
      hourlyRateEgp: rate,
      availableSlots: const [
        'Today 6:00 PM',
        'Tomorrow 5:00 PM',
        'Sat 12:00 PM',
      ],
      avgRating: rating,
      reviewCount: 18 + id.length,
      isVerified: true,
    );
  }

  static ReviewItem _review(
    String id,
    int rating,
    String name,
    String comment,
  ) => ReviewItem(
    id: id,
    rating: rating,
    createdAt: DateTime.now().subtract(Duration(days: id.length * 3)),
    reviewerName: name,
    comment: comment,
  );

  static String _level(int index) =>
      ['Beginner', 'Intermediate', 'Advanced'][index % 3];
  static String _day(int index) =>
      ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Sat'][index % 6];
  static String _thumb(int index) {
    const ids = [
      'photo-1503676260728-1c00da094a0b',
      'photo-1522202176988-66273c2fd55f',
      'photo-1509062522246-3755977927d7',
      'photo-1532094349884-543bc11b234d',
      'photo-1513258496099-48168024aec0',
    ];
    return 'https://images.unsplash.com/${ids[index % ids.length]}?auto=format&fit=crop&w=600&q=70';
  }
}
