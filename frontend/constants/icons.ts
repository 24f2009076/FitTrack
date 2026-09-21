import activate from "@/assets/icons/activate.png";
import activity from "@/assets/icons/activity.png";
import add from "@/assets/icons/add.png";
import adobe from "@/assets/icons/adobe.png";
import backPrimary from "@/assets/icons/back-primary.png";
import back from "@/assets/icons/back.png";
import calendarRegularAccent from "@/assets/icons/calendar-regular-accent.png";
import canva from "@/assets/icons/canva.png";
import downArrowAccent from "@/assets/icons/chevron-down-accent.png";
import downArrowPrimary from "@/assets/icons/chevron-down-primary.png";
import circleFaded from "@/assets/icons/circle-faded.png";
import circleMuted from "@/assets/icons/circle-solid.png";
import claude from "@/assets/icons/claude.png";
import clock from "@/assets/icons/clock-regular.png";
import coach from "@/assets/icons/coach.png";
import completedAccent from "@/assets/icons/completed-accent.png";
import currentAccent from "@/assets/icons/current-accent.png";
import dateAccent from "@/assets/icons/date-accent.png";
import date from "@/assets/icons/days-of-week.png";
import dropbox from "@/assets/icons/dropbox.png";
import duration from "@/assets/icons/duration.png";
import editAccent from "@/assets/icons/edit-accent.png";
import edit from "@/assets/icons/edit.png";
import exercisesMuted from "@/assets/icons/exercises-muted.png";
import exercises from "@/assets/icons/exercises.png";
import eyeAccent from "@/assets/icons/eye-accent.png";
import eyeDark from "@/assets/icons/eye-dark.png";
import figma from "@/assets/icons/figma.png";
import github from "@/assets/icons/github.png";
import go from "@/assets/icons/go.png";
import home from "@/assets/icons/home.png";
import levelBadge from "@/assets/icons/level-badge.png";
import logout from "@/assets/icons/logout.png";
import medium from "@/assets/icons/medium.png";
import menu from "@/assets/icons/menu.png";
import minus from "@/assets/icons/minus-solid.png";
import notion from "@/assets/icons/notion.png";
import openai from "@/assets/icons/openai.png";
import playMuted from "@/assets/icons/play-solid.png";
import plusAccent from "@/assets/icons/plus-accent.png";
import profile from "@/assets/icons/profile.png";
import progressDestructive from "@/assets/icons/progress-destructive.png";
import progressSuccess from "@/assets/icons/progress-succcess.png";
import progress from "@/assets/icons/progress.png";
import reps from "@/assets/icons/reps.png";
import setting from "@/assets/icons/setting.png";
import spotify from "@/assets/icons/spotify.png";
import squarePlusRegular from "@/assets/icons/square-plus-regular.png";
import squarePlusSolid from "@/assets/icons/square-plus-solid.png";
import stopMuted from "@/assets/icons/stop-solid.png";
import streakBadge from "@/assets/icons/streak-badge.png";
import trashMuted from "@/assets/icons/trash-can-muted.png";
import trophy from "@/assets/icons/trophy.png";
import wallet from "@/assets/icons/wallet.png";
import workout from "@/assets/icons/workout.png";


export const icons = {
    minus,
    home,
    wallet,
    setting,
    activity,
    progress,
    add,
    back,
    menu,
    notion,
    dropbox,
    openai,
    adobe,
    medium,
    figma,
    spotify,
    github,
    claude,
    canva,
    workout,
    coach,
    profile,
    levelBadge,
    streakBadge,
    exercises,
    reps,
    duration,
    trophy,
    date,
    exercisesMuted,
    edit,
    dateAccent,
    activate,
    backPrimary,
    go,
    squarePlusRegular,
    squarePlusSolid,
    plusAccent,
    editAccent,
    eyeAccent,
    eyeDark,
    logout,
    trashMuted,
    downArrowPrimary,
    downArrowAccent,
    playMuted,
    stopMuted,
    currentAccent,
    completedAccent,
    circleFaded,
    circleMuted,
    clock,
    calendarRegularAccent,
    progressSuccess,
    progressDestructive
} as const;

export type IconKey = keyof typeof icons;