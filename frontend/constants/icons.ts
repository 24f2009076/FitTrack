import activate from "@/assets/icons/activate.png";
import activity from "@/assets/icons/activity.png";
import add from "@/assets/icons/add.png";
import adobe from "@/assets/icons/adobe.png";
import backPrimary from "@/assets/icons/back-primary.png";
import back from "@/assets/icons/back.png";
import canva from "@/assets/icons/canva.png";
import claude from "@/assets/icons/claude.png";
import coach from "@/assets/icons/coach.png";
import dateAccent from "@/assets/icons/date-accent.png";
import date from "@/assets/icons/days-of-week.png";
import dropbox from "@/assets/icons/dropbox.png";
import duration from "@/assets/icons/duration.png";
import editAccent from "@/assets/icons/edit-accent.png";
import edit from "@/assets/icons/edit.png";
import exercisesMuted from "@/assets/icons/exercises-muted.png";
import exercises from "@/assets/icons/exercises.png";
import figma from "@/assets/icons/figma.png";
import github from "@/assets/icons/github.png";
import go from "@/assets/icons/go.png";
import home from "@/assets/icons/home.png";
import levelBadge from "@/assets/icons/level-badge.png";
import medium from "@/assets/icons/medium.png";
import menu from "@/assets/icons/menu.png";
import notion from "@/assets/icons/notion.png";
import openai from "@/assets/icons/openai.png";
import plusAccent from "@/assets/icons/plus-accent.png";
import profile from "@/assets/icons/profile.png";
import progress from "@/assets/icons/progress.png";
import reps from "@/assets/icons/reps.png";
import setting from "@/assets/icons/setting.png";
import spotify from "@/assets/icons/spotify.png";
import squarePlusRegular from "@/assets/icons/square-plus-regular.png";
import squarePlusSolid from "@/assets/icons/square-plus-solid.png";
import streakBadge from "@/assets/icons/streak-badge.png";
import trophy from "@/assets/icons/trophy.png";
import wallet from "@/assets/icons/wallet.png";
import workout from "@/assets/icons/workout.png";


export const icons = {
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
} as const;

export type IconKey = keyof typeof icons;