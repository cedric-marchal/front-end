// React and Hooks
import { useEffect, useState } from "react";

// Data and Types
import {
  USER_MAIN_DATA,
  USER_ACTIVITY,
  USER_AVERAGE_SESSIONS,
  USER_PERFORMANCE,
  UserMainData,
  UserActivity,
  UserPerformance,
  UserAverageSessions,
} from "./assets/mock";

// Components
import { Header } from "./components/Header";
import { NutritionInfoSection } from "./components/nutrition-info/NutritionInfoSection";
import { UserActivitySection } from "./components/user-activity/UserActivitySection";
import { AverageSessionSection } from "./components/average-session/AverageSessionSection";

import { ProgressRingSection } from "./components/progress-ring/ProgressRingSection";
import { RadarChartComponent } from "./components/radar-chart/RadarChartComponent";
import { Sidebar } from "./components/Sidebar";

function App() {
  const [userId, setUserId] = useState<number>(12);

  const [currentUser, setCurrentUser] = useState<UserMainData | undefined>(
    undefined
  );

  const [currentUserActivity, setCurrentUserActivity] =
    useState<UserActivity | null>(null);

  const [currentUserAverageSessions, setCurrentUserAverageSessions] =
    useState<UserAverageSessions | null>(null);

  const [currentUserPerformance, setCurrentUserPerformance] =
    useState<UserPerformance | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const urls = [
          `http://localhost:3000/user/${userId}`,
          `http://localhost:3000/user/${userId}/activity`,
          `http://localhost:3000/user/${userId}/average-sessions`,
          `http://localhost:3000/user/${userId}/performance`,
        ];

        const responses = await Promise.all(urls.map((url) => fetch(url)));
        const dataPromises = responses.map((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
          }
          return response.json();
        });

        const [userData, activityData, averageSessionsData, performanceData] =
          await Promise.all(dataPromises);

        setCurrentUser(userData.data);
        setCurrentUserActivity(activityData.data);
        setCurrentUserAverageSessions(averageSessionsData.data);
        setCurrentUserPerformance(performanceData.data);
      } catch (error) {
        const currentUserData: UserMainData = USER_MAIN_DATA[0];

        const currentUserActivity: UserActivity = USER_ACTIVITY.find(
          (activity: UserActivity) => activity.userId === currentUserData?.id
        ) as UserActivity;

        const currentUserAverageSessions: UserAverageSessions =
          USER_AVERAGE_SESSIONS.find(
            (averageSession: UserAverageSessions) =>
              averageSession.userId === currentUserData.id
          ) as UserAverageSessions;

        const currentUserPerformance: UserPerformance = USER_PERFORMANCE.find(
          (performance: UserPerformance) =>
            performance.userId === currentUserData.id
        ) as UserPerformance;

        setCurrentUser(currentUserData);
        setCurrentUserActivity(currentUserActivity);
        setCurrentUserAverageSessions(currentUserAverageSessions);
        setCurrentUserPerformance(currentUserPerformance);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, currentUser?.id]);

  const transformedData =
    currentUserPerformance?.data?.map((dataPoint) => ({
      subject: currentUserPerformance.kind[dataPoint.kind],
      A: dataPoint.value,
      fullMark: 100,
    })) || [];

  if (loading) return <div>Loading...</div>;

  return (
    <div className="relative w-full">
      <Header />
      <main className="flex h-screen">
        <Sidebar />

        <div className="flex flex-col lg:items-center xl:px-16">
          <div className="flex flex-col w-full pt-28 gap-7">
            <h1 className="text-3xl font-semibold text-secondary">
              Bonjour
              <span className="ml-2 text-primary">
                {currentUser?.userInfos.firstName}
              </span>
            </h1>
            <p>Félicitation ! Vous avez explosé vos objectifs hier 👏</p>
          </div>

          <div className="flex w-full gap-48 mt-4 xl:flex-row lg:flex-col lg:items-center justify-evenly">
            <div className="flex flex-col items-center justify-center">
              <div className="flex flex-col">
                <UserActivitySection data={currentUserActivity?.sessions} />
                <div className="flex justify-center w-full gap-10 xl:flex-row lg:flex-col lg:items-center mt-28">
                  <AverageSessionSection
                    sessions={currentUserAverageSessions?.sessions}
                  />
                  <RadarChartComponent data={transformedData} />
                  <ProgressRingSection
                    progress={
                      currentUser?.todayScore
                        ? currentUser?.todayScore
                        : currentUser?.score
                    }
                  />
                </div>
              </div>
            </div>

            <NutritionInfoSection {...currentUser?.keyData} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
