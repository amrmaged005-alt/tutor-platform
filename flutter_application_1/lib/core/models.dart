class AuthUser {
  const AuthUser({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
  });

  final String id;
  final String email;
  final String name;
  final String role;

  factory AuthUser.fromJson(Map<String, dynamic> json) => AuthUser(
    id: json['id'] as String,
    email: (json['email'] as String?) ?? '',
    name: (json['name'] as String?) ?? '',
    role: (json['role'] as String?) ?? 'STUDENT',
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'name': name,
    'role': role,
  };
}

class AppClass {
  const AppClass({
    required this.id,
    required this.title,
    required this.subject,
    required this.city,
    required this.priceEgp,
    required this.bookingsCount,
    required this.format,
    required this.curriculum,
    required this.language,
    this.description,
    this.location,
    this.gradeLevel,
    this.schedule,
    this.capacity,
    this.spotsLeft,
    this.totalSeats,
    this.enrolledSeats,
    this.durationMinutes = 90,
    this.level = 'Intermediate',
    this.status = 'ACTIVE',
    this.thumbnailUrl,
    this.paymentType = 'IN_PERSON',
    this.avgRating,
    this.reviewCount = 0,
    this.providerName = 'Coursaty',
    this.tutors = const [],
    this.postClassContent,
  });

  final String id;
  final String title;
  final String subject;
  final String city;
  final int priceEgp;
  final int bookingsCount;
  final String format;
  final String curriculum;
  final String language;
  final String? description;
  final String? location;
  final String? gradeLevel;
  final String? schedule;
  final int? capacity;
  final int? spotsLeft;
  final int? totalSeats;
  final int? enrolledSeats;
  final int durationMinutes;
  final String level;
  final String status;
  final String? thumbnailUrl;
  final String paymentType;
  final double? avgRating;
  final int reviewCount;
  final String providerName;
  final List<TutorMini> tutors;
  final PostClassContent? postClassContent;

  int get seatLimit => totalSeats ?? capacity ?? 20;
  int get seatsTaken => enrolledSeats ?? bookingsCount;
  int get remainingSeats {
    final left = spotsLeft ?? (seatLimit - seatsTaken);
    return left < 0 ? 0 : left;
  }

  bool get isFull => remainingSeats <= 0;
  bool get isLowSeats => !isFull && remainingSeats <= 3;

  factory AppClass.fromJson(Map<String, dynamic> json) {
    final center = json['center'] as Map<String, dynamic>?;
    final owner = json['owner'] as Map<String, dynamic>?;
    final rawTutors = (json['tutors'] as List<dynamic>? ?? [])
        .whereType<Map<String, dynamic>>()
        .map((entry) {
          final nested = entry['tutor'];
          return nested is Map<String, dynamic> ? nested : entry;
        })
        .map(TutorMini.fromJson)
        .toList();

    return AppClass(
      id: json['id'] as String,
      title: (json['title'] as String?) ?? '',
      subject: (json['subject'] as String?) ?? '',
      city: (json['city'] as String?) ?? '',
      priceEgp: (json['priceEgp'] as num?)?.toInt() ?? 0,
      bookingsCount:
          (json['bookingsCount'] as num?)?.toInt() ??
          (json['_count']?['bookings'] as num?)?.toInt() ??
          0,
      format: (json['format'] as String?) ?? 'IN_PERSON',
      curriculum: (json['curriculum'] as String?) ?? 'NATIONAL',
      language: (json['language'] as String?) ?? 'Arabic',
      description: json['description'] as String?,
      location: json['location'] as String?,
      gradeLevel: json['gradeLevel'] as String?,
      schedule: json['schedule'] as String?,
      capacity: (json['capacity'] as num?)?.toInt(),
      spotsLeft: (json['spotsLeft'] as num?)?.toInt(),
      totalSeats:
          (json['totalSeats'] as num?)?.toInt() ??
          (json['capacity'] as num?)?.toInt(),
      enrolledSeats:
          (json['enrolledSeats'] as num?)?.toInt() ??
          (json['bookingsCount'] as num?)?.toInt(),
      durationMinutes: (json['durationMinutes'] as num?)?.toInt() ?? 90,
      level: (json['level'] as String?) ?? 'Intermediate',
      status: (json['status'] as String?) ?? 'ACTIVE',
      thumbnailUrl: json['thumbnailUrl'] as String?,
      paymentType: (json['paymentType'] as String?) ?? 'IN_PERSON',
      avgRating: (json['avgRating'] as num?)?.toDouble(),
      reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
      providerName:
          (center?['name'] as String?) ??
          (owner?['fullName'] as String?) ??
          (owner?['name'] as String?) ??
          (rawTutors.isNotEmpty ? rawTutors.first.name : 'Coursaty'),
      tutors: rawTutors,
      postClassContent: json['postClassContent'] is Map<String, dynamic>
          ? PostClassContent.fromJson(
              json['postClassContent'] as Map<String, dynamic>,
            )
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'subject': subject,
    'city': city,
    'priceEgp': priceEgp,
    'bookingsCount': bookingsCount,
    'format': format,
    'curriculum': curriculum,
    'language': language,
    'description': description,
    'location': location,
    'gradeLevel': gradeLevel,
    'schedule': schedule,
    'capacity': capacity,
    'spotsLeft': remainingSeats,
    'totalSeats': seatLimit,
    'enrolledSeats': seatsTaken,
    'durationMinutes': durationMinutes,
    'level': level,
    'status': status,
    'thumbnailUrl': thumbnailUrl,
    'paymentType': paymentType,
    'avgRating': avgRating,
    'reviewCount': reviewCount,
    'providerName': providerName,
    'tutors': tutors.map((item) => item.toJson()).toList(),
    'postClassContent': postClassContent?.toJson(),
  };

  AppClass copyWith({
    String? id,
    String? title,
    String? subject,
    String? city,
    int? priceEgp,
    int? bookingsCount,
    String? format,
    String? curriculum,
    String? language,
    String? description,
    String? location,
    String? gradeLevel,
    String? schedule,
    int? capacity,
    int? spotsLeft,
    int? totalSeats,
    int? enrolledSeats,
    int? durationMinutes,
    String? level,
    String? status,
    String? thumbnailUrl,
    String? paymentType,
    double? avgRating,
    int? reviewCount,
    String? providerName,
    List<TutorMini>? tutors,
    PostClassContent? postClassContent,
  }) => AppClass(
    id: id ?? this.id,
    title: title ?? this.title,
    subject: subject ?? this.subject,
    city: city ?? this.city,
    priceEgp: priceEgp ?? this.priceEgp,
    bookingsCount: bookingsCount ?? this.bookingsCount,
    format: format ?? this.format,
    curriculum: curriculum ?? this.curriculum,
    language: language ?? this.language,
    description: description ?? this.description,
    location: location ?? this.location,
    gradeLevel: gradeLevel ?? this.gradeLevel,
    schedule: schedule ?? this.schedule,
    capacity: capacity ?? this.capacity,
    spotsLeft: spotsLeft ?? this.spotsLeft,
    totalSeats: totalSeats ?? this.totalSeats,
    enrolledSeats: enrolledSeats ?? this.enrolledSeats,
    durationMinutes: durationMinutes ?? this.durationMinutes,
    level: level ?? this.level,
    status: status ?? this.status,
    thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
    paymentType: paymentType ?? this.paymentType,
    avgRating: avgRating ?? this.avgRating,
    reviewCount: reviewCount ?? this.reviewCount,
    providerName: providerName ?? this.providerName,
    tutors: tutors ?? this.tutors,
    postClassContent: postClassContent ?? this.postClassContent,
  );
}

class PostClassContent {
  const PostClassContent({this.notesUrl, this.recordingUrl, this.homeworkUrl});

  final String? notesUrl;
  final String? recordingUrl;
  final String? homeworkUrl;

  factory PostClassContent.fromJson(Map<String, dynamic> json) =>
      PostClassContent(
        notesUrl: json['notesUrl'] as String?,
        recordingUrl: json['recordingUrl'] as String?,
        homeworkUrl: json['homeworkUrl'] as String?,
      );

  Map<String, dynamic> toJson() => {
    'notesUrl': notesUrl,
    'recordingUrl': recordingUrl,
    'homeworkUrl': homeworkUrl,
  };
}

class TutorMini {
  const TutorMini({
    required this.id,
    required this.name,
    this.photoUrl,
    this.isVerified = false,
  });

  final String id;
  final String name;
  final String? photoUrl;
  final bool isVerified;

  factory TutorMini.fromJson(Map<String, dynamic> json) => TutorMini(
    id: json['id'] as String,
    name: (json['fullName'] as String?) ?? (json['name'] as String?) ?? '',
    photoUrl: json['photoUrl'] as String?,
    isVerified: json['isVerified'] == true,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'photoUrl': photoUrl,
    'isVerified': isVerified,
  };
}

class TutorProfile {
  const TutorProfile({
    required this.id,
    required this.name,
    required this.city,
    required this.subjects,
    required this.classCount,
    required this.studentCount,
    this.bio,
    this.photoUrl,
    this.centerName,
    this.hourlyRateEgp = 250,
    this.availableSlots = const [],
    this.avgRating,
    this.reviewCount = 0,
    this.isVerified = false,
    this.classes = const [],
  });

  final String id;
  final String name;
  final String city;
  final List<String> subjects;
  final int classCount;
  final int studentCount;
  final String? bio;
  final String? photoUrl;
  final String? centerName;
  final int hourlyRateEgp;
  final List<String> availableSlots;
  final double? avgRating;
  final int reviewCount;
  final bool isVerified;
  final List<AppClass> classes;

  factory TutorProfile.fromJson(Map<String, dynamic> json) {
    final center = json['center'] as Map<String, dynamic>?;
    return TutorProfile(
      id: json['id'] as String,
      name: (json['fullName'] as String?) ?? (json['name'] as String?) ?? '',
      city:
          (json['city'] as String?) ?? (center?['city'] as String?) ?? 'Cairo',
      subjects: (json['subjects'] as List<dynamic>? ?? [])
          .map((item) => item.toString())
          .toList(),
      classCount: (json['classCount'] as num?)?.toInt() ?? 0,
      studentCount: (json['studentCount'] as num?)?.toInt() ?? 0,
      bio: json['bio'] as String?,
      photoUrl: json['photoUrl'] as String?,
      centerName: center?['name'] as String?,
      hourlyRateEgp: (json['hourlyRateEgp'] as num?)?.toInt() ?? 250,
      availableSlots: (json['availableSlots'] as List<dynamic>? ?? [])
          .map((item) => item.toString())
          .toList(),
      avgRating: (json['avgRating'] as num?)?.toDouble(),
      reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
      isVerified: json['isVerified'] == true,
      classes: (json['classes'] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(AppClass.fromJson)
          .toList(),
    );
  }
}

class EducationCenter {
  const EducationCenter({
    required this.id,
    required this.name,
    required this.city,
    required this.location,
    required this.subjects,
    required this.rating,
    required this.tutorCount,
    required this.description,
    this.logoUrl,
  });

  final String id;
  final String name;
  final String city;
  final String location;
  final List<String> subjects;
  final double rating;
  final int tutorCount;
  final String description;
  final String? logoUrl;
}

class BookingItem {
  const BookingItem({
    required this.id,
    required this.status,
    required this.paymentStatus,
    required this.createdAt,
    required this.classItem,
    this.amountEgp,
    this.studentName,
    this.studentPhone,
    this.attendance = const {},
  });

  final String id;
  final String status;
  final String paymentStatus;
  final DateTime createdAt;
  final AppClass classItem;
  final int? amountEgp;
  final String? studentName;
  final String? studentPhone;
  final Map<String, bool> attendance;

  factory BookingItem.fromJson(Map<String, dynamic> json) {
    final student = json['student'] as Map<String, dynamic>?;
    return BookingItem(
      id: json['id'] as String,
      status: (json['status'] as String?) ?? 'PENDING',
      paymentStatus: (json['paymentStatus'] as String?) ?? 'UNPAID',
      createdAt:
          DateTime.tryParse((json['createdAt'] ?? '').toString()) ??
          DateTime.now(),
      classItem: AppClass.fromJson(json['class'] as Map<String, dynamic>),
      amountEgp: (json['amountEgp'] as num?)?.toInt(),
      studentName:
          (student?['fullName'] as String?) ?? (student?['name'] as String?),
      studentPhone:
          (student?['phone'] as String?) ?? (json['studentPhone'] as String?),
      attendance: (json['attendance'] as Map<String, dynamic>? ?? {}).map(
        (key, value) => MapEntry(key, value == true),
      ),
    );
  }
}

class BookingResult {
  const BookingResult({
    required this.bookingId,
    required this.message,
    this.paymentUrl,
  });

  final String bookingId;
  final String message;
  final String? paymentUrl;

  factory BookingResult.fromJson(Map<String, dynamic> json) => BookingResult(
    bookingId: (json['bookingId'] as String?) ?? '',
    message: (json['message'] as String?) ?? 'Booking received.',
    paymentUrl: json['paymentUrl'] as String?,
  );
}

class ReviewItem {
  const ReviewItem({
    required this.id,
    required this.rating,
    required this.createdAt,
    required this.reviewerName,
    this.comment,
  });

  final String id;
  final int rating;
  final DateTime createdAt;
  final String reviewerName;
  final String? comment;

  factory ReviewItem.fromJson(Map<String, dynamic> json) {
    final student = json['student'] as Map<String, dynamic>?;
    final rawName =
        (student?['fullName'] as String?) ??
        (student?['name'] as String?) ??
        (json['reviewerName'] as String?) ??
        'Student';
    return ReviewItem(
      id: json['id'] as String,
      rating: (json['rating'] as num?)?.toInt() ?? 0,
      createdAt:
          DateTime.tryParse((json['createdAt'] ?? '').toString()) ??
          DateTime.now(),
      reviewerName: rawName.trim().split(RegExp(r'\s+')).first,
      comment: json['comment'] as String?,
    );
  }
}

class ClassFilters {
  const ClassFilters({
    this.subjects = const [],
    this.format = '',
    this.maxPrice = 500,
    this.city = '',
    this.sortBy = 'newest',
  });

  final List<String> subjects;
  final String format;
  final double maxPrice;
  final String city;
  final String sortBy;

  String get primarySubject => subjects.isEmpty ? '' : subjects.first;

  ClassFilters copyWith({
    List<String>? subjects,
    String? format,
    double? maxPrice,
    String? city,
    String? sortBy,
  }) => ClassFilters(
    subjects: subjects ?? this.subjects,
    format: format ?? this.format,
    maxPrice: maxPrice ?? this.maxPrice,
    city: city ?? this.city,
    sortBy: sortBy ?? this.sortBy,
  );

  static const empty = ClassFilters();
}
