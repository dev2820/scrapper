import { useEffect } from "react";
import {
  ShareTargetModule,
  ShareTargetEventEmitter,
} from "@/modules/ShareTargetModule";
import { SharedMessage } from "@/types/SharedMessage";
import { isAOS } from "@/utils/device";

// Android가 공유받기를 이용할 수 있게 함
export const useSharedTargetAndroid = (
  onShared: (message: SharedMessage) => void,
) => {
  useEffect(() => {
    if (!isAOS()) return;

    // 앱이 공유로 시작될 때의 초기 데이터 가져오기
    ShareTargetModule.getInitialShare()
      .then((shareData) => {
        console.log("init", shareData);
        if (shareData && shareData.mimeType === "text/plain") {
          onShared({
            data: shareData.data,
            mimeType: "text/plain",
          });
        }
      })
      .catch((error) => {
        console.error("Error getting initial share:", error);
      });

    // 앱이 실행 중일 때 공유 이벤트 리스너 등록
    const subscription = ShareTargetEventEmitter.addListener(
      "ShareTargetEvent",
      (shareData) => {
        console.log("subs", shareData);
        if (shareData && shareData.mimeType === "text/plain") {
          onShared({
            data: shareData.data,
            mimeType: "text/plain",
          });
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [onShared]);
};
