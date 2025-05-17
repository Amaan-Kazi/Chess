import type {ClientRect, Modifier} from "@dnd-kit/core";
import type {Transform} from "@dnd-kit/utilities";

function restrictToBoundingRect(transform: Transform, rect: ClientRect, boundingRect: ClientRect): Transform {
  const value = {...transform};

  const centerX = rect.left + rect.width / 2 + transform.x;
  const centerY = rect.top + rect.height / 2 + transform.y;

  const minX = boundingRect.left;
  const maxX = boundingRect.left + boundingRect.width;
  const minY = boundingRect.top;
  const maxY = boundingRect.top + boundingRect.height;

  // Clamp center point within bounds
  if      (centerX < minX) value.x += minX - centerX;
  else if (centerX > maxX) value.x -= centerX - maxX;

  if      (centerY < minY) value.y += minY - centerY;
  else if (centerY > maxY) value.y -= centerY - maxY;

  return value;
}

const restrictCenterToParent: Modifier = ({containerNodeRect, draggingNodeRect, transform}) => {
  if (!draggingNodeRect || !containerNodeRect) return transform;
  return restrictToBoundingRect(transform, draggingNodeRect, containerNodeRect);
};

export default restrictCenterToParent;
