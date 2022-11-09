function data_export() {
  // Values: 1-5 / 5 more / ...
  const FROM = 1;
  const TO = 5;

  // Create root folder "Google Data Export"
  const rootFolder = DriveApp.createFolder(`Google Export ${FROM}-${TO}`);

  // Get all courses
  let { courses } = Classroom.Courses.list();
  courses = courses.slice(FROM - 1, TO)
  console.log('Kurse:', courses.length, courses.map(el => el.name));

  // Iterate through all courses
  courses.forEach(course => {
    console.log(`Name: "${course.name}" (${course.id})`);

    // Create course folder "[course-name]" and save course data
    const courseFolder = rootFolder.createFolder(course.name);
    let courseData = `Name: ${course.name}\nBeschreibung: ${course.descriptionHeading ?? '-'}\nText: ${course.description ?? '-'}\nErstellt: ${formatDate(new Date(course.creationTime))}\nAktualisiert: ${course.updateTime ? formatDate(new Date(course.updateTime)) : '-'}\n`;
    
    // Get course students
    const { students } = Classroom.Courses.Students.list(course.id);
    courseData += 'Schüler:';
    students.forEach(student => {
      const studentData = Classroom.UserProfiles.get(student.userId);
      courseData += ` ${studentData.name.fullName} (${studentData.emailAddress})`;
    });
    courseData += '\n';

    // Get course teachers
    const { teachers } = Classroom.Courses.Teachers.list(course.id);
    courseData += 'Lehrer:';
    teachers.forEach(teacher => {
      const teacherData = Classroom.UserProfiles.get(teacher.userId);
      courseData += ` ${teacherData.name.fullName} (${teacherData.emailAddress})`;
    });
    courseData += '\n';

    // Get course topics
    const { topic } = Classroom.Courses.Topics.list(course.id);
    if (topic) {
      courseData += 'Themen:';
      topic.forEach(topic => {
        courseData += ` / ${topic.name}`;
      });
      courseData += '\n';
    }

    // Save collected data to "details.txt"
    courseFolder.createFile('kurs-info.txt', courseData);

    function formatDate(date) {
      function padTo2Digits(num) {
        return num.toString().padStart(2, '0');
      }
      return [
        padTo2Digits(date.getDate()),
        padTo2Digits(date.getMonth() + 1),
        date.getFullYear(),
      ].join('.');
    }

    // Iterate through all announcements
    let { announcements } = Classroom.Courses.Announcements.list(course.id);
    if (announcements) {
      // Create announcement folder "Announcement [created]" and save announcement data
      announcements.forEach(announcement => {
        const announcementFolder = courseFolder.createFolder(`Ankündigung ${formatDate(new Date(announcement.creationTime))}`);
        let announcementData = `Text:\n${announcement.text}\nErstellt: ${formatDate(new Date(announcement.creationTime))}\nAktualisiert: ${announcement.updateTime ? formatDate(new Date(announcement.updateTime)) : '-'}\n`;
        announcementFolder.createFile('info.txt', announcementData);

        // Get announcement attachments
        const { materials } = announcement;
        if (materials)
          materials.forEach(material => {
            // Type: drive file
            if (material.driveFile) {
              const { id } = material.driveFile.driveFile;
              try { announcementFolder.createFile(DriveApp.getFileById(id)); }
              catch (error) {
                console.error(`Error (Course: ${course.name} / Title: ${announcement.text.substring(0, 50)} / File: ${ material.driveFile.driveFile.alternateLink }) /`, error)
                rootFolder.createFile(`ERROR - ${course.name} - ${announcement.text.substring(0, 30)}`, `File: ${ material.driveFile.driveFile.alternateLink }\nError: ${JSON.stringify(error)}`);
              }
            }
            // Type: youtube video
            else if (material.youtubeVideo) {
              const { youtubeVideo } = material;
              announcementFolder.createFile(`YouTube Video (${youtubeVideo.title}).txt`, `Video ID: ${youtubeVideo.id}\nURL: ${youtubeVideo.alternateLink}\n`);
            }
            // Type: link
            else if (material.link) {
              const { link } = material;
              announcementFolder.createFile(`Link ${link.title ? `(${link.title})` : '' }.txt`, `URL: ${link.url}\n`);
            }
          });
      });
    }

    // Iterate through all course work
    let { courseWork } = Classroom.Courses.CourseWork.list(course.id);
    if (courseWork)
    {
      courseWork.forEach(work => {
          // Create course work folder "[name]" and save course work data
          const courseWorkFolder = courseFolder.createFolder(`${work.title}`);
          // Get student submissions
          const { studentSubmissions } = Classroom.Courses.CourseWork.StudentSubmissions.list(course.id, work.id);
          let courseWorkData = `Name: ${work.title}\nTyp: ${work.workType}\nBeschreibung:\n${work.description ?? "-"}\nPunkte: ${studentSubmissions[0].assignedGrade ?? '-'}/${work.maxPoints ?? '-'}\nAbgabedatum: ${work.dueDate && work.dueTime ? `${work.dueDate.day}.${work.dueDate.month}.${work.dueDate.year} ${work.dueTime.hours}:${work.dueTime.minutes}${work.dueTime.seconds ? `:${work.dueTime.seconds}` : ''}` : '-'}\nErstellt: ${formatDate(new Date(work.creationTime))}\nAktualisiert: ${work.updateTime ? formatDate(new Date(work.updateTime)) : '-'}\n`;
          courseWorkFolder.createFile('info.txt', courseWorkData);

          // Get course work attachments
          const { materials } = work;
          if (materials)
            materials.forEach(material => {
              // Type: drive file
              if (material.driveFile) {
                const { id } = material.driveFile.driveFile;
                try { courseWorkFolder.createFile(DriveApp.getFileById(id)); }
                catch (error) {
                  console.error(`Error (Course: ${course.name} / Title: ${work.title} / File: ${ material.driveFile.driveFile.alternateLink }) /`, error);
                  rootFolder.createFile(`ERROR - ${course.name} - ${work.title}`, `File: ${ material.driveFile.driveFile.alternateLink }\nError: ${JSON.stringify(error)}`);
                }
              }
              // Type: youtube video
              else if (material.youtubeVideo) {
                const { youtubeVideo } = material;
                courseWorkFolder.createFile(`YouTube Video (${youtubeVideo.title}).txt`, `Video ID: ${youtubeVideo.id}\nURL: ${youtubeVideo.alternateLink}\n`);
              }
              // Type: link
              else if (material.link) {
                const { link } = material;
                courseWorkFolder.createFile(`Link ${link.title ? `(${link.title})` : '' }.txt`, `URL: ${link.url}\n`);
              }
            });

          studentSubmissions.forEach(submission => {
            if (submission.assignmentSubmission)
            {
              const {attachments} = submission.assignmentSubmission;
              if (attachments)
              {
                const submissionFolder = courseWorkFolder.createFolder('Abgabe');
                attachments.forEach(material => {
                  // Type: drive file
                  if (material.driveFile) {
                    const { id } = material.driveFile;
                    try { submissionFolder.createFile(DriveApp.getFileById(id)); }
                    catch (error) {
                      console.error(`Error (Course: ${course.name} / Title: ${work.title} / File: ${ material.driveFile.alternateLink }) /`, error);
                      rootFolder.createFile(`ERROR - ${course.name} - ${work.title}`, `File: ${ material.driveFile.alternateLink }\nError: ${JSON.stringify(error)}`);
                    }
                  }
                  // Type: youtube video
                  else if (material.youtubeVideo) {
                    const { youtubeVideo } = material;
                    submissionFolder.createFile(`YouTube Video (${youtubeVideo.title}).txt`, `Video ID: ${youtubeVideo.id}\nURL: ${youtubeVideo.alternateLink}\n`);
                  }
                  // Type: link
                  else if (material.link) {
                    const { link } = material;
                    submissionFolder.createFile(`Link ${link.title ? `(${link.title})` : '' }.txt`, `URL: ${link.url}\n`);
                  }
                });
              }
            }
          });
          
        });
    }

    // Iterate through all course work materials
    let { courseWorkMaterial } = Classroom.Courses.CourseWorkMaterials.list(course.id);
    if (courseWorkMaterial)
    {
      courseWorkMaterial.forEach(workMaterial => {
        // Create course work material folder "[name]" and save course work material data
        const courseWorkMaterialFolder = courseFolder.createFolder(`${workMaterial.title}`);
        let courseWorkMaterialData = `Name: ${workMaterial.title}\nBeschreibung:\n${workMaterial.description ?? "-"}\nErstellt: ${formatDate(new Date(workMaterial.creationTime))}\nAktualisiert: ${workMaterial.updateTime ? formatDate(new Date(workMaterial.updateTime)) : '-'}\n`;
        courseWorkMaterialFolder.createFile('info.txt', courseWorkMaterialData);

        // Get course work material attachments
        const { materials } = workMaterial;
          if (materials)
            materials.forEach(material => {
              // Type: drive file
              if (material.driveFile) {
                const { id } = material.driveFile.driveFile;
                try { courseWorkMaterialFolder.createFile(DriveApp.getFileById(id)); }
                catch (error) {
                  console.error(`Error (Course: ${course.name} / Title: ${workMaterial.title} / File: ${ material.driveFile.driveFile.alternateLink }) /`, error);
                  rootFolder.createFile(`ERROR - ${course.name} - ${workMaterial.title}`, `File: ${ material.driveFile.driveFile.alternateLink }\nError: ${JSON.stringify(error)}`);
                }
              }
              // Type: youtube video
              else if (material.youtubeVideo) {
                const { youtubeVideo } = material;
                courseWorkMaterialFolder.createFile(`YouTube Video (${youtubeVideo.title}).txt`, `Video ID: ${youtubeVideo.id}\nURL: ${youtubeVideo.alternateLink}\n`);
              }
              // Type: link
              else if (material.link) {
                const { link } = material;
                courseWorkMaterialFolder.createFile(`Link ${link.title ? `(${link.title})` : '' }.txt`, `URL: ${link.url}\n`);
              }
            });
      });
    }
  });
}
