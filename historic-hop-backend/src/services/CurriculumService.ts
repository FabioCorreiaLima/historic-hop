import { CurriculumRepository, DEFAULT_COURSE_ID } from "../repositories/CurriculumRepository.js";
import { LessonRepository } from "../repositories/LessonRepository.js";
import { UserLessonProgressRepository } from "../repositories/UserLessonProgressRepository.js";
import { PeriodService } from "./PeriodService.js";

export class CurriculumService {
  static mainLessonId(periodId: string) {
    return `lesson_${periodId}_main`;
  }

  private static formatLesson(row: Record<string, unknown>) {
    return {
      id: row.id as string,
      periodId: row.period_id as string,
      title: row.title as string,
      orderIndex: row.order_index as number,
      xpReward: row.xp_reward as number,
    };
  }

  private static formatProgressRow(row: Record<string, unknown>) {
    return {
      stars: row.stars as number,
      crownLevel: row.crown_level as number,
      bestPercentage: row.best_percentage as number,
      bestScore: row.best_score as number,
      attempts: row.attempts as number,
      timeSpent: row.time_spent as number,
    };
  }

  static async getPublicPath(courseId: string = DEFAULT_COURSE_ID) {
    const course = await CurriculumRepository.getCourse(courseId);
    if (!course) return null;

    const periodIds = await CurriculumRepository.getOrderedPeriodIds(courseId);
    const allPeriods = await PeriodService.getAllPeriods();
    const pmap = new Map(allPeriods.map((p) => [p.id, p]));

    const units = [];
    for (let i = 0; i < periodIds.length; i++) {
      const pid = periodIds[i];
      const period = pmap.get(pid);
      if (!period) continue;

      const lessonRows = await LessonRepository.listByPeriod(pid);
      const lessons = lessonRows.map((r) => this.formatLesson(r as Record<string, unknown>));

      units.push({
        period,
        orderIndex: i,
        lessons,
      });
    }

    return {
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
      },
      units,
    };
  }

  static async getPathForUser(userId: string, courseId: string = DEFAULT_COURSE_ID) {
    const base = await this.getPublicPath(courseId);
    if (!base) return null;

    const progressRows = await UserLessonProgressRepository.getByUser(userId);
    const progressByLesson = new Map(
      progressRows.map((r: Record<string, unknown>) => [r.lesson_id as string, r])
    );

    const units = base.units.map((unit, idx) => {
      const prevPeriodId = idx > 0 ? base.units[idx - 1].period.id : null;
      let unlocked = idx === 0;
      if (!unlocked && prevPeriodId) {
        const mainId = this.mainLessonId(prevPeriodId);
        const prevProg = progressByLesson.get(mainId) as Record<string, unknown> | undefined;
        const stars = (prevProg?.stars as number) ?? 0;
        const pct = (prevProg?.best_percentage as number) ?? 0;
        unlocked = stars >= 1 || pct >= 70;
      }

      const lessons = unit.lessons.map((les) => {
        const row = progressByLesson.get(les.id) as Record<string, unknown> | undefined;
        return {
          ...les,
          progress: row ? this.formatProgressRow(row) : null,
        };
      });

      return { ...unit, unlocked, lessons };
    });

    return { ...base, units };
  }
}
