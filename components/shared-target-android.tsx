import { useEffect } from "react";
import {
  ShareTargetModule,
  ShareTargetEventEmitter,
} from "@/modules/ShareTargetModule";
import { SharedMessage } from "@/types/SharedMessage";

export function SharedTargetAndroid(props: {
  onShared: (message: SharedMessage) => void;
}) {
  const { onShared } = props;
  useEffect(() => {
    // 앱이 공유로 시작될 때의 초기 데이터 가져오기
    ShareTargetModule.getInitialShare()
      .then((shareData) => {
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

  return null;
}
